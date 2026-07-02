import '../src/config/env.js';
import { connectDB, getPool } from '../src/config/database.js';

async function test() {
    try {
        console.log('Testing server database connection config...');
        const pool = await connectDB();
        console.log('Connected to SafeMotherInventory database!');
        const result = await pool.request().query("SELECT name FROM sys.tables");
        console.log('Tables in database:');
        console.table(result.recordset);
        process.exit(0);
    } catch (error) {
        console.error('Server database connection failed:', error.message);
        process.exit(1);
    }
}

test();
