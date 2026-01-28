require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/utils/database');

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups', timestamp);

    try {
        // Create backup directory
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        console.log(`Starting backup to: ${backupDir}`);

        // Get all tables in the public schema
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);

        const tables = tablesResult.rows.map(row => row.table_name);

        for (const table of tables) {
            console.log(`Backing up table: ${table}`);
            const dataResult = await pool.query(`SELECT * FROM ${table}`);
            const filePath = path.join(backupDir, `${table}.json`);
            fs.writeFileSync(filePath, JSON.stringify(dataResult.rows, null, 2));
        }

        console.log('Backup completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Backup failed:', err);
        process.exit(1);
    }
}

backup();
