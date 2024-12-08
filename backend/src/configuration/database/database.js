const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER_UPDATE,
    password: process.env.DB_PASSWORD_UPDATE,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});

const databaseConnection = () => {
    client.connect()
        .then(() => { console.log('Connected to PostgreSQL'); })
        .catch((error) => {
            console.error('Connection error', error.stack);
            process.exit(1);
        });

    process.on('SIGINT', () => {
        client.end(() => {
            console.log('PostgreSQL client disconnected');
            process.exit(0);
        });
    });
}

module.exports = { databaseConnection, client };