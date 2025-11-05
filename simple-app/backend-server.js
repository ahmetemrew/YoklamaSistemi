const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const Database = require('better-sqlite3');
const QRCode = require('qrcode');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Setup
const dbPath = path.join(__dirname, 'yoklama.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Database
const schema = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  qr_code_data TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL,
  device_id TEXT,
  scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_qr ON participants(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_attendance_participant ON attendance(participant_id);
`;

db.exec(schema);
console.log('✅ Database initialized');

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
    res.json(events);
});

// Get event by ID
app.get('/api/events/:id', (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
        return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }

    // Get stats
    const total = db.prepare('SELECT COUNT(*) as count FROM participants WHERE event_id = ?').get(req.params.id);
    const attended = db.prepare(`
        SELECT COUNT(DISTINCT participant_id) as count
        FROM attendance
        WHERE participant_id IN (SELECT id FROM participants WHERE event_id = ?)
    `).get(req.params.id);

    res.json({
        ...event,
        stats: {
            total: total.count,
            attended: attended.count,
            remaining: total.count - attended.count
        }
    });
});

// Create event
app.post('/api/events', (req, res) => {
    const { name, date, location, is_active } = req.body;
    const stmt = db.prepare('INSERT INTO events (name, date, location, is_active) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, date, location || null, is_active !== undefined ? is_active : 1);

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(event);
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Etkinlik silindi' });
});

// Get participants by event
app.get('/api/events/:eventId/participants', (req, res) => {
    const participants = db.prepare(`
        SELECT p.*,
            (SELECT COUNT(*) FROM attendance WHERE participant_id = p.id) as scan_count
        FROM participants p
        WHERE p.event_id = ?
        ORDER BY p.name
    `).all(req.params.eventId);
    res.json(participants);
});

// Create participant
app.post('/api/participants', (req, res) => {
    const { event_id, name, email, phone } = req.body;
    const qr_code_data = uuidv4();

    try {
        const stmt = db.prepare(`
            INSERT INTO participants (event_id, name, email, phone, qr_code_data)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(event_id, name, email || null, phone || null, qr_code_data);

        const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(participant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Generate QR Codes
app.get('/api/events/:eventId/qrcodes', async (req, res) => {
    const participants = db.prepare('SELECT * FROM participants WHERE event_id = ?').all(req.params.eventId);

    if (participants.length === 0) {
        return res.status(404).json({ error: 'Katılımcı bulunamadı' });
    }

    const qrDir = path.join(__dirname, 'temp_qrcodes');
    if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir);
    }

    // Generate QR codes
    for (const p of participants) {
        const qrPath = path.join(qrDir, `${p.id}_${p.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
        await QRCode.toFile(qrPath, p.qr_code_data, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H'
        });
    }

    // Create ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="QR_Kodlari.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(qrDir, false);

    archive.on('end', () => {
        // Cleanup
        fs.rmSync(qrDir, { recursive: true, force: true });
    });

    await archive.finalize();
});

// Scan QR Code
app.post('/api/attendance/scan', (req, res) => {
    const { qr_code, device_id } = req.body;

    const participant = db.prepare('SELECT * FROM participants WHERE qr_code_data = ?').get(qr_code);

    if (!participant) {
        return res.status(404).json({
            success: false,
            error: 'Geçersiz QR kod'
        });
    }

    // Check if already scanned
    const alreadyScanned = db.prepare('SELECT * FROM attendance WHERE participant_id = ? LIMIT 1').get(participant.id);

    if (alreadyScanned) {
        return res.status(200).json({
            success: false,
            warning: true,
            message: 'Bu kişi daha önce yoklama verdi',
            participant: { name: participant.name, email: participant.email }
        });
    }

    // Create attendance record
    const stmt = db.prepare('INSERT INTO attendance (participant_id, device_id) VALUES (?, ?)');
    stmt.run(participant.id, device_id || 'unknown');

    // Get stats
    const total = db.prepare('SELECT COUNT(*) as count FROM participants WHERE event_id = ?').get(participant.event_id);
    const attended = db.prepare(`
        SELECT COUNT(DISTINCT participant_id) as count
        FROM attendance
        WHERE participant_id IN (SELECT id FROM participants WHERE event_id = ?)
    `).get(participant.event_id);

    const stats = {
        total: total.count,
        attended: attended.count,
        remaining: total.count - attended.count
    };

    // Emit via Socket.IO
    io.emit('attendance:new', {
        success: true,
        participant: { name: participant.name, email: participant.email },
        stats
    });

    res.json({
        success: true,
        message: `${participant.name} yoklamaya kaydedildi`,
        participant: { name: participant.name, email: participant.email },
        stats
    });
});

// Get attendance by event
app.get('/api/events/:eventId/attendance', (req, res) => {
    const attendance = db.prepare(`
        SELECT a.*, p.name, p.email, p.event_id
        FROM attendance a
        JOIN participants p ON a.participant_id = p.id
        WHERE p.event_id = ?
        ORDER BY a.scanned_at DESC
    `).all(req.params.eventId);
    res.json(attendance);
});

// Serve simple scanner page
app.get('/scanner', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Scanner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }
        .header {
            color: white;
            text-align: center;
            margin-bottom: 30px;
        }
        #reader {
            width: 100%;
            max-width: 500px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .result {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .success { border-left: 5px solid #27ae60; }
        .warning { border-left: 5px solid #f39c12; }
        .error { border-left: 5px solid #e74c3c; }
    </style>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="header">
        <h1>📱 QR Scanner</h1>
        <p>Kamerayı QR koda doğrultun</p>
    </div>
    <div id="reader"></div>
    <div id="result"></div>

    <script>
        const socket = io();
        let lastScan = '';
        let lastScanTime = 0;

        const scanner = new Html5Qrcode("reader");
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                const now = Date.now();
                if (decodedText === lastScan && now - lastScanTime < 3000) return;

                lastScan = decodedText;
                lastScanTime = now;

                fetch('/api/attendance/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qr_code: decodedText, device_id: 'mobile' })
                })
                .then(r => r.json())
                .then(data => {
                    const result = document.getElementById('result');
                    const className = data.success ? 'success' : (data.warning ? 'warning' : 'error');
                    result.className = 'result ' + className;
                    result.innerHTML = '<h2>' + (data.message || data.error) + '</h2>';
                    if (data.participant) {
                        result.innerHTML += '<p>' + data.participant.name + '</p>';
                    }
                    setTimeout(() => { result.innerHTML = ''; }, 3000);
                });
            }
        );
    </script>
</body>
</html>
    `);
});

// Serve static files (simple-app frontend)
app.use(express.static(__dirname));

// Start Server
server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('==========================================');
    console.log('🚀 Yoklama Sistemi Başlatıldı!');
    console.log('==========================================');
    console.log(`📍 Admin Panel: http://localhost:${PORT}`);
    console.log(`📱 Scanner URL: http://${localIP}:${PORT}/scanner`);
    console.log('==========================================');
});

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Socket.IO
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
