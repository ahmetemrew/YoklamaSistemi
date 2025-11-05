const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database dosyası için klasör oluştur
const dbDir = path.join(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'yoklama.db');
const db = new Database(dbPath);

// WAL mode için performans artışı
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ Database connected:', dbPath);

module.exports = db;
