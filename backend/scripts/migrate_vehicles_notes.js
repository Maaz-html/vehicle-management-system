require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Running migration: Adding notes column to vehicles table...');
    try {
        await pool.query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes TEXT;');
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
