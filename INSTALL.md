# 📥 Yoklama Sistemi - Local Kurulum Rehberi

## 🎯 Hızlı Kurulum (5 Dakika)

### 1️⃣ Projeyi İndir

```bash
# Terminal/CMD/PowerShell'i aç
# İstediğin klasöre git (örnek: Desktop)
cd Desktop

# Repo'yu klonla
git clone https://github.com/ahmetemrew/YoklamaSistemi.git

# Veya SSH ile:
git clone git@github.com:ahmetemrew/YoklamaSistemi.git

# Klasöre gir
cd YoklamaSistemi
```

### 2️⃣ Dependencies Yükle

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Root'a dön
cd ..
```

### 3️⃣ Database Başlat

```bash
cd backend
npm run init-db
```

**Çıktı:**
```
✅ Database connected: /path/to/database/yoklama.db
📦 Initializing database schema...
✅ Database schema initialized successfully!
📝 Creating sample event...
✅ Sample event created!
```

### 4️⃣ Frontend'i Build Et

```bash
cd ../frontend
npm run build
```

**Çıktı:**
```
vite v5.4.21 building for production...
✓ 148 modules transformed.
dist/index.html                   0.62 kB
dist/assets/index-*.css           9.82 kB
dist/assets/index-*.js           96.09 kB
✓ built in 2.75s
```

### 5️⃣ Sistemi Başlat

```bash
cd ../backend
npm start
```

**Çıktı:**
```
🚀 Yoklama Sistemi Başlatıldı!
📍 Admin Panel: http://localhost:3000
📱 Scanner URL: http://localhost:3000/scanner
📡 Telefonlardan bağlanmak için:
   http://192.168.1.100:3000/scanner
```

### 6️⃣ Tarayıcıda Aç

```
http://localhost:3000
```

---

## ⚡ Tek Komutla Kurulum (Windows)

```bash
git clone https://github.com/ahmetemrew/YoklamaSistemi.git && cd YoklamaSistemi && cd backend && npm install && npm run init-db && cd ../frontend && npm install && npm run build && cd ../backend && npm start
```

## ⚡ Tek Komutla Kurulum (Linux/Mac)

```bash
git clone https://github.com/ahmetemrew/YoklamaSistemi.git && \
cd YoklamaSistemi && \
cd backend && npm install && npm run init-db && \
cd ../frontend && npm install && npm run build && \
cd ../backend && npm start
```

---

## 🛠️ Development Mode (Geliştirme için)

Frontend'i her değişiklikte build etmek istemiyorsan:

**Terminal 1 - Backend:**
```bash
cd YoklamaSistemi/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd YoklamaSistemi/frontend
npm run dev
```

Bu durumda:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (Vite dev server)

---

## 📂 Belirli Klasöre Kurulum

### Windows Örneği:
```cmd
# Masaüstüne kur
cd C:\Users\YourName\Desktop
git clone https://github.com/ahmetemrew/YoklamaSistemi.git
cd YoklamaSistemi
build.bat
```

### Linux/Mac Örneği:
```bash
# Home dizinine kur
cd ~
git clone https://github.com/ahmetemrew/YoklamaSistemi.git
cd YoklamaSistemi
chmod +x build.sh
./build.sh
```

### Belgelerim klasörüne:
```bash
# Windows
cd C:\Users\YourName\Documents
git clone ...

# Mac
cd ~/Documents
git clone ...

# Linux
cd ~/Documents
git clone ...
```

---

## 🔧 Manuel Kurulum (Git olmadan)

Git yüklü değilse:

### 1. ZIP İndir
- GitHub'da **Code** → **Download ZIP**
- ZIP'i aç istediğin klasöre

### 2. Kurulum
```bash
# ZIP'in açıldığı klasöre git
cd /path/to/YoklamaSistemi-main

# Aynı adımlar
cd backend && npm install && npm run init-db
cd ../frontend && npm install && npm run build
cd ../backend && npm start
```

---

## ✅ Kurulum Kontrolü

Her adımdan sonra kontrol et:

### 1. Dependencies yüklendi mi?
```bash
# Backend
ls backend/node_modules | wc -l
# Çıktı: 300+ klasör olmalı

# Frontend
ls frontend/node_modules | wc -l
# Çıktı: 100+ klasör olmalı
```

### 2. Frontend build edildi mi?
```bash
ls frontend/dist
# Çıktı: index.html ve assets/ klasörü olmalı
```

### 3. Database oluştu mu?
```bash
ls database/
# Çıktı: yoklama.db dosyası olmalı
```

### 4. Server çalışıyor mu?
```bash
curl http://localhost:3000/api/health
# Çıktı: {"status":"OK","timestamp":"..."}
```

---

## 🐛 Sorun Giderme

### "npm: command not found"
```bash
# Node.js yükle
https://nodejs.org/
# Sonra terminal'i yeniden başlat
```

### "git: command not found"
```bash
# Git yükle
https://git-scm.com/
# Veya ZIP indirme yöntemini kullan
```

### "Port 3000 already in use"
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Veya farklı port kullan:
PORT=3001 npm start
```

### "EACCES: permission denied"
```bash
# Linux/Mac: sudo kullan
sudo npm install

# Veya npm'i user-level yükle
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### "better-sqlite3 build failed"
```bash
# Windows: Build tools yükle
npm install --global windows-build-tools

# Linux: Build tools yükle
sudo apt-get install build-essential

# Mac: Xcode tools
xcode-select --install

# Sonra tekrar dene
cd backend
npm rebuild better-sqlite3
```

---

## 🗂️ Klasör Yapısı (Kurulum Sonrası)

```
YoklamaSistemi/
├── backend/
│   ├── node_modules/        ← npm install ile oluşur
│   └── src/
├── frontend/
│   ├── node_modules/        ← npm install ile oluşur
│   ├── dist/                ← npm run build ile oluşur
│   └── src/
├── database/
│   └── yoklama.db           ← npm run init-db ile oluşur
└── README.md
```

---

## 🚀 Farklı Ortamlara Kurulum

### Windows 10/11
```powershell
# PowerShell Administrator olarak aç
cd C:\Projects
git clone ...
cd YoklamaSistemi
.\build.bat
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install nodejs npm git
cd ~/projects
git clone ...
cd YoklamaSistemi
chmod +x build.sh
./build.sh
```

### macOS
```bash
# Homebrew ile Node.js yükle
brew install node git
cd ~/projects
git clone ...
cd YoklamaSistemi
chmod +x build.sh
./build.sh
```

---

## 🎯 Önerilen Klasör Yerleri

| İşletim Sistemi | Önerilen Yer | Komut |
|-----------------|--------------|-------|
| Windows | `C:\Projects\` | `cd C:\Projects` |
| Mac | `~/Projects/` | `cd ~/Projects` |
| Linux | `~/projects/` | `cd ~/projects` |
| Masaüstü | `Desktop/` | `cd ~/Desktop` |
| Belgeler | `Documents/` | `cd ~/Documents` |

---

## 📋 Komple Komut Listesi

Kopyala-yapıştır kullanıma hazır:

```bash
# 1. Klasöre git (örnek: Desktop)
cd ~/Desktop

# 2. Klonla
git clone https://github.com/ahmetemrew/YoklamaSistemi.git
cd YoklamaSistemi

# 3. Backend
cd backend
npm install
npm run init-db

# 4. Frontend
cd ../frontend
npm install
npm run build

# 5. Başlat
cd ../backend
npm start
```

---

## ✅ Başarı Mesajı

Eğer şunu görüyorsan başarılı:

```
==================================================
🚀 Yoklama Sistemi Başlatıldı!
==================================================

📍 Admin Panel: http://localhost:3000
📱 Scanner URL: http://localhost:3000/scanner

📡 Telefonlardan bağlanmak için:
   http://192.168.1.XXX:3000/scanner

==================================================
```

Tarayıcıda `http://localhost:3000` adresini aç!

---

## 🆘 Hala Sorun mu Var?

1. **README.md** dosyasını oku
2. **QUICKSTART.md** dosyasına bak
3. GitHub'da issue aç
4. Terminal çıktısını kopyala ve paylaş

---

## 🎉 Kurulum Tamamlandı!

Artık sistemi kullanmaya başlayabilirsin:
1. ✅ Admin panelini aç
2. ✅ Yeni etkinlik oluştur
3. ✅ Katılımcı ekle
4. ✅ QR tarama yap

İyi kullanımlar! 🚀
