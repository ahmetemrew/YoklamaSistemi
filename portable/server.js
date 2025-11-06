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

// Simple test endpoint for phone connectivity
app.get('/test', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bağlantı Testi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 20px;
        }
        h1 { font-size: 32px; margin-bottom: 20px; text-align: center; }
        .box { background: white; color: #333; padding: 15px; border-radius: 10px; margin: 15px 0; }
        .box h3 { margin-top: 0; color: #27ae60; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0; }
        .info { background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin: 5px 0; }
        button { background: #27ae60; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; width: 100%; margin: 10px 0; }
        button:active { background: #1e8449; }
        #log { font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto; background: #f8f9fa; color: #333; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>📱 Telefon Bağlantı Testi</h1>

    <div class="box">
        <h3>1️⃣ Bağlantı Durumu</h3>
        <div class="success">✅ HTTP Bağlantısı Başarılı!</div>
        <div class="info">
            <strong>Senin IP'n:</strong> ${req.ip}<br>
            <strong>Server IP:</strong> ${getLocalIP()}<br>
            <strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}
        </div>
    </div>

    <div class="box">
        <h3>2️⃣ Scanner Sayfası Testi</h3>
        <p>Scanner sayfası açılıyor mu test edelim:</p>
        <button onclick="testScanner()">🧪 Scanner'ı Test Et</button>
        <div id="scannerResult"></div>
    </div>

    <div class="box">
        <h3>3️⃣ WebSocket Testi</h3>
        <p>Canlı bağlantı çalışıyor mu test edelim:</p>
        <button onclick="testWebSocket()">🔌 WebSocket Test Et</button>
        <div id="wsResult"></div>
    </div>

    <div class="box">
        <h3>4️⃣ Kamera Erişimi Testi</h3>
        <p>Kameraya erişim var mı kontrol edelim:</p>
        <button onclick="testCamera()">📷 Kamera Test Et</button>
        <div id="cameraResult"></div>
    </div>

    <div class="box">
        <h3>🔗 Direkt Linkler</h3>
        <button onclick="window.location.href='/scanner'">📱 Scanner'a Git</button>
        <button onclick="window.location.href='/'">🏠 Ana Sayfa</button>
    </div>

    <div class="box">
        <h3>📋 Test Logları</h3>
        <div id="log"></div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        function log(msg) {
            const logDiv = document.getElementById('log');
            const time = new Date().toLocaleTimeString('tr-TR');
            logDiv.innerHTML += time + ' - ' + msg + '<br>';
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        async function testScanner() {
            const result = document.getElementById('scannerResult');
            result.innerHTML = '<div class="info">⏳ Test ediliyor...</div>';
            log('Scanner testi başladı');

            try {
                const response = await fetch('/scanner');
                const html = await response.text();

                if (response.ok && html.length > 100) {
                    result.innerHTML = '<div class="success">✅ Scanner sayfası yükleniyor! ('+html.length+' byte)</div>';
                    log('✅ Scanner sayfası başarıyla yüklendi: ' + html.length + ' byte');
                } else {
                    result.innerHTML = '<div class="error">❌ Scanner sayfası yüklenemedi! HTTP ' + response.status + '</div>';
                    log('❌ Scanner hatası: HTTP ' + response.status);
                }
            } catch (error) {
                result.innerHTML = '<div class="error">❌ HATA: ' + error.message + '</div>';
                log('❌ Scanner fetch hatası: ' + error.message);
            }
        }

        function testWebSocket() {
            const result = document.getElementById('wsResult');
            result.innerHTML = '<div class="info">⏳ Bağlanıyor...</div>';
            log('WebSocket testi başladı');

            try {
                const socket = io(window.location.origin);

                socket.on('connect', () => {
                    result.innerHTML = '<div class="success">✅ WebSocket bağlantısı BAŞARILI!</div>';
                    log('✅ WebSocket bağlandı: ' + socket.id);

                    socket.emit('identify', { type: 'test', name: 'Test Device' });

                    setTimeout(() => {
                        socket.disconnect();
                        log('WebSocket bağlantısı kapatıldı');
                    }, 2000);
                });

                socket.on('connect_error', (error) => {
                    result.innerHTML = '<div class="error">❌ WebSocket hatası: ' + error.message + '</div>';
                    log('❌ WebSocket hatası: ' + error.message);
                });
            } catch (error) {
                result.innerHTML = '<div class="error">❌ HATA: ' + error.message + '</div>';
                log('❌ WebSocket exception: ' + error.message);
            }
        }

        async function testCamera() {
            const result = document.getElementById('cameraResult');
            result.innerHTML = '<div class="info">⏳ Kamera izni isteniyor...</div>';
            log('Kamera testi başladı');

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                result.innerHTML = '<div class="success">✅ Kamera erişimi VAR! Kamera çalışıyor.</div>';
                log('✅ Kamera erişimi başarılı');

                // Stop camera
                stream.getTracks().forEach(track => track.stop());
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    result.innerHTML = '<div class="error">❌ Kamera izni VERİLMEDİ! Tarayıcı ayarlarından izin ver.</div>';
                    log('❌ Kamera izni reddedildi');
                } else if (error.name === 'NotFoundError') {
                    result.innerHTML = '<div class="error">❌ Kamera BULUNAMADI!</div>';
                    log('❌ Kamera bulunamadı');
                } else {
                    result.innerHTML = '<div class="error">❌ Kamera hatası: ' + error.message + '</div>';
                    log('❌ Kamera hatası: ' + error.name + ' - ' + error.message);
                }
            }
        }

        log('Test sayfası yüklendi');
        log('User Agent: ' + navigator.userAgent);
    </script>
</body>
</html>
    `);
});

// Frontend HTML (embedded)
const frontendHTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const frontendJS = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const scannerHTML = fs.readFileSync(path.join(__dirname, 'scanner2.html'), 'utf8');

app.get('/', (req, res) => {
    res.send(frontendHTML);
});

app.get('/app.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(frontendJS);
});

// Main scanner endpoint - uses scanner2.html (the good one)
app.get('/scanner', (req, res) => {
    res.send(scannerHTML);
});

// Track connected devices
const connectedDevices = new Map();

io.on('connection', (socket) => {
    const deviceInfo = {
        id: socket.id,
        connectedAt: new Date(),
        lastActivity: new Date(),
        type: 'scanner', // or 'admin'
        scans: 0
    };

    connectedDevices.set(socket.id, deviceInfo);

    console.log('📱 Client connected:', socket.id);
    console.log('📊 Total connected devices:', connectedDevices.size);

    // Broadcast device count to all clients
    io.emit('devices:update', {
        count: connectedDevices.size,
        devices: Array.from(connectedDevices.values())
    });

    // Identify device type
    socket.on('identify', (data) => {
        const device = connectedDevices.get(socket.id);
        if (device) {
            device.type = data.type || 'scanner';
            device.name = data.name || 'Unknown';
        }
    });

    socket.on('disconnect', () => {
        connectedDevices.delete(socket.id);
        console.log('📱 Client disconnected:', socket.id);
        console.log('📊 Total connected devices:', connectedDevices.size);

        // Broadcast updated device count
        io.emit('devices:update', {
            count: connectedDevices.size,
            devices: Array.from(connectedDevices.values())
        });
    });
});

// API endpoint to get connected devices
app.get('/api/devices', (req, res) => {
    res.json({
        count: connectedDevices.size,
        devices: Array.from(connectedDevices.values())
    });
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
    const allIPs = [];
    const realIPs = []; // Non-virtual network interfaces

    // Virtual network keywords to skip
    const virtualKeywords = ['vEthernet', 'VMware', 'VirtualBox', 'Hyper-V', 'Docker', 'vboxnet', 'vmnet'];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                const ip = { name, address: iface.address };
                allIPs.push(ip);
                console.log(`   📡 ${name}: ${iface.address}`);

                // Check if this is a real (non-virtual) interface
                const isVirtual = virtualKeywords.some(keyword =>
                    name.toLowerCase().includes(keyword.toLowerCase())
                );

                if (!isVirtual) {
                    realIPs.push(ip);
                }
            }
        }
    }

    // Priority 1: Real interfaces with 192.168.x.x
    const real192 = realIPs.find(ip => ip.address.startsWith('192.168'));
    if (real192) {
        console.log(`   ✅ Using IP: ${real192.address} (${real192.name}) [Real WiFi/Ethernet]`);
        return real192.address;
    }

    // Priority 2: Real interfaces with 10.x.x.x
    const real10 = realIPs.find(ip => ip.address.startsWith('10.'));
    if (real10) {
        console.log(`   ✅ Using IP: ${real10.address} (${real10.name}) [Real WiFi/Ethernet]`);
        return real10.address;
    }

    // Priority 3: Any real interface
    if (realIPs.length > 0) {
        console.log(`   ✅ Using IP: ${realIPs[0].address} (${realIPs[0].name}) [Real Interface]`);
        return realIPs[0].address;
    }

    // Priority 4: Virtual interfaces with 192.168.x.x (fallback)
    const virtual192 = allIPs.find(ip => ip.address.startsWith('192.168'));
    if (virtual192) {
        console.log(`   ⚠️  Using IP: ${virtual192.address} (${virtual192.name}) [Virtual - May not work with phone]`);
        return virtual192.address;
    }

    // Priority 5: Any IP (last resort)
    if (allIPs.length > 0) {
        console.log(`   ⚠️  Using IP: ${allIPs[0].address} (${allIPs[0].name}) [Virtual - May not work with phone]`);
        return allIPs[0].address;
    }

    console.log(`   ⚠️  No network interface found, using localhost`);
    return 'localhost';
}
