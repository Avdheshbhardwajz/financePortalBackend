const { Client } = require('pg');
require('dotenv').config();

const client_update = new Client({
    host: process.env.DB_HOST_UPDATE,
    port: process.env.DB_PORT_UPDATE,
    user: process.env.DB_USER_UPDATE,
    password: process.env.DB_PASSWORD_UPDATE,
    database: process.env.DB_NAME_UPDATE,
    ssl: {
        rejectUnauthorized: false,
    },
});

const databaseUpdateConnection = () => {
    client_update.connect()
        .then(() => { console.log('Connected to PostgreSQL for update'); })
        .catch((error) => {
            console.error('Connection error', error.stack);
            process.exit(1);
        });

    process.on('SIGINT', () => {
        client.end(() => {
            console.log('PostgreSQL for update client disconnected');
            process.exit(0);
        });
    });
}

module.exports = { databaseUpdateConnection, client_update };