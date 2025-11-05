# 🚀 Deployment Guide

## Windows .exe Oluşturma

### Gereksinimler
- Node.js 18+ yüklü
- Windows işletim sistemi (veya Wine ile Linux/Mac)

### Adımlar

1. **Dependencies'leri yükle**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

2. **Frontend'i build et**
```bash
cd frontend
npm run build
```

3. **Backend'i hazırla**
```bash
cd ../backend
# Test et
npm run init-db
npm start
```

4. **Electron build**
```bash
cd ..
npm run electron:build
```

5. **Çıktı**
- `release/YoklamaSistemi-Setup-1.0.0.exe` (Installer)
- `release/win-unpacked/` (Portable version)

### Build Sorunları

#### "node-gyp" hatası
```bash
npm install --global windows-build-tools
```

#### "better-sqlite3" hatası
```bash
cd backend
npm rebuild better-sqlite3
```

## Production Deployment

### Seçenek 1: Standalone .exe
En basit yöntem. Kullanıcı `.exe` dosyasını indirir ve çalıştırır.

**장점:**
- Kurulum kolay
- İnternet gerektirmez
- Tüm veriler local

**Dezavantajlar:**
- Güncelleme manuel
- Sadece Windows

### Seçenek 2: Cloud Server (VPS)

Merkezi bir sunucuda çalıştır.

```bash
# Server'a deploy
ssh user@server-ip

# Node.js yükle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Projeyi kopyala
git clone <repo-url>
cd YoklamaSistemi

# Dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build
cd ..

# PM2 ile çalıştır
npm install -g pm2
cd backend
pm2 start src/server.js --name yoklama-sistem
pm2 save
pm2 startup
```

**Nginx Reverse Proxy (Opsiyonel)**
```nginx
server {
    listen 80;
    server_name yoklama.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Seçenek 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Frontend build
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Copy backend source
COPY backend/ ./backend/

# Database directory
RUN mkdir -p /app/database

EXPOSE 3000

CMD ["node", "backend/src/server.js"]
```

```bash
# Build
docker build -t yoklama-sistem .

# Run
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  --name yoklama \
  yoklama-sistem
```

**Docker Compose**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./database:/app/database
      - ./qrcodes:/app/qrcodes
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
```

## Environment Variables

Production'da `.env` dosyası oluştur:

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/database/yoklama.db
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

Backend'de kullanım:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

## Güvenlik

### 1. HTTPS Kullan (Production)
```bash
# Let's Encrypt ile ücretsiz SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yoklama.example.com
```

### 2. CORS Ayarları
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // max 100 request
});

app.use('/api/', limiter);
```

### 4. Input Validation
```bash
npm install express-validator
```

### 5. SQL Injection Koruması
Better-sqlite3 prepared statements zaten koruyor, ancak:
```javascript
// ✅ Güvenli
db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// ❌ Tehlikeli
db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get();
```

## Backup

### SQLite Database Backup
```bash
# Manuel backup
cp database/yoklama.db database/backups/yoklama_$(date +%Y%m%d).db

# Otomatik daily backup (cron)
0 2 * * * cp /path/to/database/yoklama.db /path/to/backups/yoklama_$(date +\%Y\%m\%d).db
```

### Automated Backup Script
```javascript
// backend/src/scripts/backup.js
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const date = new Date().toISOString().split('T')[0];
const backupPath = path.join(backupDir, `yoklama_${date}.db`);

db.backup(backupPath)
  .then(() => console.log(`Backup created: ${backupPath}`))
  .catch(err => console.error('Backup failed:', err));
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs yoklama-sistem
pm2 restart yoklama-sistem
```

### Health Check Endpoint
```javascript
// Zaten var: GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### External Monitoring
- UptimeRobot (ücretsiz)
- Pingdom
- StatusCake

## Performance Optimization

### 1. Database Optimization
```javascript
// SQLite WAL mode (zaten aktif)
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000');
```

### 2. Gzip Compression
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Static File Caching
```javascript
app.use(express.static('frontend/dist', {
  maxAge: '1d',
  etag: true
}));
```

## Scaling

### Horizontal Scaling
SQLite tek dosya olduğu için horizontal scaling zor. Büyük ölçek için:

1. **PostgreSQL'e geç**
```bash
npm install pg
```

2. **Redis cache ekle**
```bash
npm install redis
```

3. **Load Balancer**
- Nginx
- HAProxy

### Vertical Scaling
- Daha güçlü CPU
- Daha fazla RAM
- SSD storage

## Troubleshooting

### Log Management
```bash
# PM2 logs
pm2 logs --lines 100

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Repair
```bash
# SQLite integrity check
sqlite3 database/yoklama.db "PRAGMA integrity_check;"

# Vacuum (optimize)
sqlite3 database/yoklama.db "VACUUM;"
```

## Update Procedure

1. Backup database
2. Pull yeni kod
3. Install dependencies
4. Build frontend
5. Restart server

```bash
# Script
#!/bin/bash
cp database/yoklama.db database/yoklama_backup.db
git pull origin main
cd backend && npm install
cd ../frontend && npm install && npm run build
cd ..
pm2 restart yoklama-sistem
```
