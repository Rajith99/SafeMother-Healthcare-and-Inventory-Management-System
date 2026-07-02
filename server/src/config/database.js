import sql from 'mssql';

const sqlConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'SafeMotherInventory',
    server: process.env.DB_SERVER || 'localhost',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 10000 
    },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

if (process.env.DB_PORT) {
    
    if (!sqlConfig.port) {
        sqlConfig.port = parseInt(process.env.DB_PORT, 10);
    }
    console.log('MSSQL config:', sqlConfig);
}



if (sqlConfig.server.includes('\\')) {
    const parts = sqlConfig.server.split('\\');
    sqlConfig.server = parts[0];
    if (!sqlConfig.port) {
        sqlConfig.options.instanceName = parts[1];
    }
}

let pool;
let connectionPromise = null;
let reconnectingPromise = null; 

class QueryRetryRequest {
    constructor(originalRequest, connectDBFn) {
        this.request = originalRequest;
        this.connectDBFn = connectDBFn;
        this.inputs = [];
        this.outputs = [];
    }

    input(...args) {
        this.inputs.push(args);
        this.request.input(...args);
        return this;
    }

    output(...args) {
        this.outputs.push(args);
        this.request.output(...args);
        return this;
    }

    async query(command) {
        let attempts = 3;
        while (attempts > 0) {
            try {
                return await this.request.query(command);
            } catch (err) {
                const errMessage = err.message || '';
                const isConnectionError = 
                    errMessage.includes('Connection lost') ||
                    errMessage.includes('ECONNRESET') ||
                    errMessage.includes('socket') ||
                    errMessage.includes('connection') ||
                    errMessage.includes('closed') ||
                    errMessage.includes('not open') ||
                    errMessage.includes('No connection');

                if (isConnectionError && attempts > 1) {
                    attempts--;
                    console.warn(`[DB Retry] Query failed due to connection error: "${errMessage}". Reconnecting pool and retrying (attempts left: ${attempts})...`);
                    try {
                        const newPool = await this.connectDBFn(true); 
                        this.request = newPool.originalRequest.call(newPool);
                        
                        
                        for (const args of this.inputs) {
                            this.request.input(...args);
                        }
                        for (const args of this.outputs) {
                            this.request.output(...args);
                        }
                    } catch (reconErr) {
                        console.error('[DB Retry] Reconnection during query retry failed:', reconErr.message);
                    }
                } else {
                    throw err;
                }
            }
        }
    }
}

export const connectDB = async (force = false) => {
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = (async () => {
        try {
            if (pool && pool.connected && !force) return pool;

            if (pool) {
                console.log('MSSQL pool exists. Closing and reconnecting...');
                try {
                    await pool.close();
                } catch (err) {
                    
                }
                pool = null;
            }

            pool = await sql.connect(sqlConfig);
            const activePool = pool;
            pool.on('error', async (err) => {
                console.error('MSSQL pool error:', err.message);
                
                if (pool === activePool) {
                    await reconnectPool();
                }
            });

            
            if (!pool.originalRequest) {
                pool.originalRequest = pool.request;
            }
            pool.request = function() {
                return new QueryRetryRequest(pool.originalRequest.apply(this, arguments), connectDB);
            };

            console.log('MSSQL connected successfully');
            return pool;
        } catch (error) {
            console.error('MSSQL connection failed:', error.message);
            pool = null;
            throw error;
        } finally {
            connectionPromise = null;
        }
    })();

    return connectionPromise;
};


async function reconnectPool() {
    if (reconnectingPromise) {
        
        return reconnectingPromise;
    }
    reconnectingPromise = (async () => {
        try {
            if (pool) {
                try {
                    await pool.close();
                } catch (e) {
                    
                }
                pool = null;
            }
            
            const newPool = await sql.connect(sqlConfig);
            const activePool = newPool;
            newPool.on('error', async (err) => {
                console.error('MSSQL pool error during reconnection:', err.message);
                if (newPool === activePool) {
                    await reconnectPool();
                }
            });
            
            if (!newPool.originalRequest) {
                newPool.originalRequest = newPool.request;
            }
            newPool.request = function () {
                return new QueryRetryRequest(newPool.originalRequest.apply(this, arguments), connectDB);
            };
            pool = newPool;
            console.log('MSSQL pool reconnected successfully');
            return pool;
        } catch (e) {
            console.error('Failed to reconnect MSSQL pool:', e.message);
            pool = null;
            throw e;
        } finally {
            reconnectingPromise = null;
        }
    })();
    return reconnectingPromise;
}

export const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectDB() first.');
    }
    return pool;
};

export { sql };




(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Auto-initialization of DB pool failed:', err.message);
  }
})();
