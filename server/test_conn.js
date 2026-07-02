import sql from 'mssql';
const config = {
    user: 'sa',
    password: '123',
    server: 'localhost',
    port: 1434,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
console.log('Connecting to master...');
sql.connect(config).then(() => {
    console.log('Successfully connected to master!');
    process.exit(0);
}).catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
});
