const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { initDatabase } = require('./config/initDatabase');
const routes = require('./routes');
const Device = require('./models/Device');

// Express app oluştur
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Socket.io'yu request'e ekle
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database başlat
try {
  initDatabase();
  console.log('✅ Database ready');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// API Routes
app.use('/api', routes);

// Static files (Frontend)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback - tüm route'lar frontend'e yönlensin
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint bulunamadı' });
  }
});

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('device:register', (data) => {
    try {
      Device.register({ ...data, id: socket.id });
      console.log('📱 Device registered:', data.name);
      io.emit('device:list', Device.getOnline());
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('device:heartbeat', (deviceId) => {
    try {
      Device.updateActivity(deviceId || socket.id);
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    Device.setOffline(socket.id);
    io.emit('device:list', Device.getOnline());
  });
});

// Periyodik cihaz kontrolü (1 dakikada bir)
setInterval(() => {
  const devices = Device.getAll();
  const now = Date.now();

  devices.forEach(device => {
    const lastActive = new Date(device.last_active).getTime();
    const inactive = now - lastActive > 60000; // 1 dakika

    if (inactive && device.is_online) {
      Device.setOffline(device.id);
      io.emit('device:list', Device.getOnline());
    }
  });
}, 60000);

// Port ayarları
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Yoklama Sistemi Başlatıldı!');
  console.log('='.repeat(50));
  console.log(`\n📍 Admin Panel: http://localhost:${PORT}`);
  console.log(`📱 Scanner URL: http://localhost:${PORT}/scanner`);

  // Local IP'yi bul
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const ips = [];

  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });

  if (ips.length > 0) {
    console.log('\n📡 Telefonlardan bağlanmak için:');
    ips.forEach(ip => {
      console.log(`   http://${ip}:${PORT}/scanner`);
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Sistem kapatılıyor...');
  server.close(() => {
    console.log('✅ Server kapatıldı');
    process.exit(0);
  });
});

module.exports = { app, server, io };
