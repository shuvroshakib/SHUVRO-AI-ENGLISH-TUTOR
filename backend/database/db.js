const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'shuvro.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split and execute each statement
const statements = schema.split(';').filter(s => s.trim().length > 0);
statements.forEach(statement => {
    try {
        db.exec(statement + ';');
    } catch (err) {
        console.error('Schema init error:', err.message);
    }
});

console.log('Database initialized at:', dbPath);

module.exports = db;
