require('dotenv').config();
const mysql = require('mysql2/promise');

exports.dbConnection = {
    async createConnection() {
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });
            console.log("Connected to the database successfully.");
            return connection;
        } catch (error) {
            console.error("Failed to connect to the database:", error);
            throw error;
        }
    }
};
