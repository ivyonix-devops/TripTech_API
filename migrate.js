import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        multipleStatements: true // Enable multiple statements query
    };

    const dbName = process.env.DB_NAME || 'triptech_db';
    console.log(`Connecting to MySQL at ${dbConfig.host} as ${dbConfig.user}...`);

    let connection;
    try {
        // 1. Connect without Database to ensure existence
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        // 2. Create Database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database '${dbName}' checked/created.`);

        // 3. Use the Database
        await connection.changeUser({ database: dbName });
        console.log(`Switched to database '${dbName}'.`);

        // 4. Read SQL file
        const sqlFilePath = path.join(__dirname, 'database.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // 5. Execute SQL
        console.log('Executing migration script...');
        await connection.query(sqlContent);

        console.log('Migration completed successfully! ✅');

    } catch (error) {
        console.error('Migration failed: ❌', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
