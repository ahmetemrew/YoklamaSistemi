const db = require('./database');

const schema = `
-- Etkinlikler (Events)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  allow_multiple_scans INTEGER DEFAULT 0,
  settings TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Katılımcılar (Participants)
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  identifier TEXT UNIQUE NOT NULL,
  qr_code_data TEXT UNIQUE NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Yoklama Kayıtları (Attendance Records)
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  scan_type TEXT DEFAULT 'entry',
  location TEXT,
  notes TEXT,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Cihazlar (Devices - QR okuyucu telefonlar)
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'scanner',
  last_active TEXT DEFAULT CURRENT_TIMESTAMP,
  is_online INTEGER DEFAULT 1,
  metadata TEXT DEFAULT '{}'
);

-- İndeksler (Performance için)
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_qr ON participants(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_attendance_participant ON attendance(participant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_device ON attendance(device_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned_at ON attendance(scanned_at);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
`;

function initDatabase() {
  try {
    console.log('📦 Initializing database schema...');

    // Şemayı uygula
    db.exec(schema);

    console.log('✅ Database schema initialized successfully!');

    // Örnek etkinlik ekle (eğer yoksa)
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
    if (eventCount.count === 0) {
      console.log('📝 Creating sample event...');
      db.prepare(`
        INSERT INTO events (name, description, date, location, is_active)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'Örnek Etkinlik',
        'İlk etkinlik örneği',
        new Date().toISOString().split('T')[0],
        'Merkez Ofis',
        1
      );
      console.log('✅ Sample event created!');
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  initDatabase();
  process.exit(0);
}

module.exports = { initDatabase };
