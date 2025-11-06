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
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Setup
const dbDir = path.join(os.homedir(), 'YoklamaSistemi');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'yoklama.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`📁 Database: ${dbPath}`);

// Initialize Database Schema
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

app.get('/api/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
    res.json(events);
});

app.get('/api/events/:id', (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadı' });

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

app.post('/api/events', (req, res) => {
    const { name, date, location, is_active } = req.body;
    const stmt = db.prepare('INSERT INTO events (name, date, location, is_active) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, date, location || null, is_active !== undefined ? is_active : 1);
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(event);
});

app.delete('/api/events/:id', (req, res) => {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Etkinlik silindi' });
});

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

app.get('/api/events/:eventId/qrcodes', async (req, res) => {
    try {
        console.log(`[QR] Generating QR codes for event ${req.params.eventId}...`);

        const participants = db.prepare('SELECT * FROM participants WHERE event_id = ?').all(req.params.eventId);

        if (participants.length === 0) {
            console.error(`[QR] No participants found for event ${req.params.eventId}`);
            return res.status(404).json({ error: 'Katılımcı bulunamadı' });
        }

        console.log(`[QR] Found ${participants.length} participants`);

        const qrDir = path.join(os.tmpdir(), 'yoklama_qr_' + Date.now());
        fs.mkdirSync(qrDir, { recursive: true });
        console.log(`[QR] Created temp directory: ${qrDir}`);

        for (const p of participants) {
            const safeName = p.name.replace(/[^a-zA-Z0-9]/g, '_');
            const qrPath = path.join(qrDir, `${p.id}_${safeName}.png`);

            try {
                await QRCode.toFile(qrPath, p.qr_code_data, {
                    width: 300,
                    margin: 2,
                    errorCorrectionLevel: 'H'
                });
                console.log(`[QR] Generated QR for: ID=${p.id}, Name=${p.name}, UUID=${p.qr_code_data.substring(0, 8)}...`);
            } catch (qrError) {
                console.error(`[QR] Failed to generate QR for ${p.name}:`, qrError);
                throw new Error(`QR kod oluşturulamadı: ${p.name}`);
            }
        }

        console.log(`[QR] All QR codes generated, creating ZIP...`);

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="QR_Kodlari.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            console.error('[QR] Archive error:', err);
            throw err;
        });

        archive.on('warning', (err) => {
            if (err.code !== 'ENOENT') {
                console.warn('[QR] Archive warning:', err);
            }
        });

        archive.on('end', () => {
            console.log(`[QR] Archive finalized, ${archive.pointer()} bytes`);
            // Clean up temp directory
            try {
                fs.rmSync(qrDir, { recursive: true, force: true });
                console.log('[QR] Temp directory cleaned up');
            } catch (cleanupError) {
                console.error('[QR] Cleanup error:', cleanupError);
            }
        });

        archive.pipe(res);
        archive.directory(qrDir, false);
        await archive.finalize();

        console.log('[QR] ZIP sent successfully');

    } catch (error) {
        console.error('[QR] Error generating QR codes:', error);

        // Clean up temp directory if it exists
        const tempDirs = fs.readdirSync(os.tmpdir())
            .filter(f => f.startsWith('yoklama_qr_'))
            .map(f => path.join(os.tmpdir(), f));

        for (const dir of tempDirs) {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'QR kodları oluşturulurken hata oluştu' });
        }
    }
});

app.post('/api/attendance/scan', (req, res) => {
    const { qr_code, device_id } = req.body;
    const participant = db.prepare('SELECT * FROM participants WHERE qr_code_data = ?').get(qr_code);

    if (!participant) {
        return res.status(404).json({ success: false, error: 'Geçersiz QR kod' });
    }

    const alreadyScanned = db.prepare('SELECT * FROM attendance WHERE participant_id = ? LIMIT 1').get(participant.id);

    if (alreadyScanned) {
        return res.status(200).json({
            success: false,
            warning: true,
            message: 'Bu kişi daha önce yoklama verdi',
            participant: { name: participant.name, email: participant.email }
        });
    }

    const stmt = db.prepare('INSERT INTO attendance (participant_id, device_id) VALUES (?, ?)');
    stmt.run(participant.id, device_id || 'unknown');

    const total = db.prepare('SELECT COUNT(*) as count FROM participants WHERE event_id = ?').get(participant.event_id);
    const attended = db.prepare(`
        SELECT COUNT(DISTINCT participant_id) as count
        FROM attendance
        WHERE participant_id IN (SELECT id FROM participants WHERE event_id = ?)
    `).get(participant.event_id);

    const stats = { total: total.count, attended: attended.count, remaining: total.count - attended.count };

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

app.get('/api/server-info', (req, res) => {
    const localIP = getLocalIP();
    res.json({
        ip: localIP,
        port: PORT,
        scannerUrl: `http://${localIP}:${PORT}/scanner`
    });
});

// Frontend HTML (embedded)
const frontendHTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const frontendJS = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

app.get('/', (req, res) => {
    res.send(frontendHTML);
});

app.get('/app.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(frontendJS);
});

app.get('/scanner', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Scanner - Yoklama Sistemi</title>
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
            background: white;
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
        #status { color: white; margin-top: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📱 QR Scanner</h1>
        <p>Kamerayı QR koda doğrultun</p>
    </div>
    <div id="reader"></div>
    <div id="result"></div>
    <div id="status">Kamera açılıyor...</div>

    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        console.log('📱 Scanner page loaded');

        // Check if libraries loaded
        if (typeof Html5Qrcode === 'undefined') {
            document.getElementById('status').innerHTML = '❌ QR kod kütüphanesi yüklenemedi!';
            alert('Hata: Html5Qrcode kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.');
        }

        if (typeof io === 'undefined') {
            document.getElementById('status').innerHTML = '❌ Socket.IO kütüphanesi yüklenemedi!';
            alert('Hata: Socket.IO yüklenemedi. Sunucu bağlantısını kontrol edin.');
        }

        let socket;
        try {
            socket = io();
            socket.on('connect', () => {
                console.log('✅ Socket.IO connected');
                document.getElementById('status').textContent = '✅ Bağlantı başarılı';
            });
            socket.on('connect_error', (err) => {
                console.error('Socket.IO error:', err);
                document.getElementById('status').textContent = '❌ Sunucu bağlantısı kurulamadı';
            });
        } catch (e) {
            console.error('Socket.IO initialization error:', e);
        }

        let lastScan = '';
        let lastScanTime = 0;

        const scanner = new Html5Qrcode("reader");

        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                const now = Date.now();
                if (decodedText === lastScan && now - lastScanTime < 3000) {
                    return; // Prevent duplicate scans
                }

                lastScan = decodedText;
                lastScanTime = now;

                console.log('📷 QR Code scanned:', decodedText);
                document.getElementById('status').textContent = '⏳ Kontrol ediliyor...';

                fetch('/api/attendance/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        qr_code: decodedText,
                        device_id: 'mobile'
                    })
                })
                .then(r => r.json())
                .then(data => {
                    const result = document.getElementById('result');
                    const className = data.success ? 'success' : (data.warning ? 'warning' : 'error');
                    result.className = 'result ' + className;
                    result.innerHTML = '<h2>' + (data.message || data.error) + '</h2>';

                    if (data.participant) {
                        result.innerHTML += '<p><strong>' + data.participant.name + '</strong></p>';
                    }

                    document.getElementById('status').textContent = '✅ Tarama tamamlandı';

                    setTimeout(() => {
                        result.innerHTML = '';
                        document.getElementById('status').textContent = '📷 Yeni QR kod bekleniyor...';
                    }, 3000);
                })
                .catch(err => {
                    console.error('API Error:', err);
                    const result = document.getElementById('result');
                    result.className = 'result error';
                    result.innerHTML = '<h2>❌ Bağlantı Hatası</h2><p>' + err.message + '</p>';
                    document.getElementById('status').textContent = '❌ Hata oluştu';
                });
            },
            (errorMessage) => {
                // QR kod bulunamadı (normal durum, sessizce geç)
            }
        ).then(() => {
            console.log('✅ Camera started');
            document.getElementById('status').textContent = '📷 QR kod bekleniyor...';
        }).catch(err => {
            console.error('❌ Camera error:', err);
            document.getElementById('status').innerHTML = '❌ Kamera açılamadı: ' + err;
            alert('Kamera izni verilmedi veya kamera kullanılamıyor: ' + err);
        });
    </script>
</body>
</html>`);
});

io.on('connection', (socket) => {
    console.log('📱 Client connected:', socket.id);
    socket.on('disconnect', () => console.log('📱 Client disconnected:', socket.id));
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Yoklama Sistemi Başlatıldı!');
    console.log('='.repeat(50));
    console.log(`📍 Admin Panel: http://localhost:${PORT}`);
    console.log(`📱 Scanner URL: http://${localIP}:${PORT}/scanner`);
    console.log('='.repeat(50) + '\n');

    // Auto-open browser
    const url = `http://localhost:${PORT}`;
    const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
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
