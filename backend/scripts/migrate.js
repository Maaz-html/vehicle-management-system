require('dotenv').config();
const pool = require('../src/utils/database');

async function migrate() {
    try {
        console.log('Running migration: Adding comments column to clients table...');
        await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS comments TEXT;');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
