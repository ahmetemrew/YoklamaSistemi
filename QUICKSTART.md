# ⚡ Quick Start Guide

5 dakikada sistemi çalıştır!

## 📋 Gereksinimler

- Node.js 18+ ([İndir](https://nodejs.org/))
- Git ([İndir](https://git-scm.com/))

## 🚀 Hızlı Kurulum

### 1. Projeyi İndir

```bash
git clone <repo-url>
cd YoklamaSistemi
```

### 2. Dependencies Yükle

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 3. Database Başlat

```bash
cd backend
npm run init-db
```

Çıktı:
```
📦 Initializing database schema...
✅ Database schema initialized successfully!
📝 Creating sample event...
✅ Sample event created!
```

### 4. Sistemi Çalıştır

#### Seçenek A: Development Mode (Önerilen)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Çıktı:
```
🚀 Yoklama Sistemi Başlatıldı!
📍 Admin Panel: http://localhost:3000
📱 Scanner URL: http://localhost:3000/scanner
📡 Telefonlardan bağlanmak için:
   http://192.168.1.100:3000/scanner
```

**Terminal 2 - Frontend (Opsiyonel):**
```bash
cd frontend
npm run dev
```

Bu sadece development için. Production'da backend frontend'i serve eder.

#### Seçenek B: Production Mode

```bash
# Frontend'i build et
cd frontend
npm run build

# Backend'i başlat
cd ../backend
npm start
```

### 5. Admin Paneli Aç

Tarayıcıda: `http://localhost:3000`

### 6. Telefonu Bağla

Telefon tarayıcısında: `http://192.168.1.100:3000/scanner`
(IP adresini backend console'dan kopyala)

---

## 📝 İlk Kullanım

### Adım 1: Etkinlik Oluştur

1. Admin panelde **"Etkinlikler"** → **"+ Yeni Etkinlik"**
2. Formu doldur:
   - Ad: `Test Etkinliği`
   - Tarih: Bugünün tarihi
   - Lokasyon: `Merkez Ofis`
3. **"Oluştur"** butonuna tıkla

### Adım 2: Katılımcı Ekle

#### Yöntem 1: Excel ile (Önerilen)

1. Örnek Excel dosyası oluştur:

| name | email | phone |
|------|-------|-------|
| Ali Yılmaz | ali@test.com | 5551234567 |
| Ayşe Demir | ayse@test.com | 5559876543 |

2. Etkinlik detayına git
3. **"📤 Excel İçe Aktar"** → Dosyayı seç
4. Yükle

#### Yöntem 2: API ile

```bash
curl -X POST http://localhost:3000/api/participants \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "name": "Test Kullanıcı",
    "email": "test@example.com"
  }'
```

### Adım 3: QR Kodları İndir

1. Etkinlik detayında **"📥 QR Kodları İndir"**
2. ZIP dosyası indirilir
3. ZIP'i aç → Her katılımcı için PNG dosyası var

### Adım 4: Tarama Yap

1. Telefonda scanner sayfasını aç
2. Cihaz adı gir: `Test Telefonu`
3. **"🎥 Taramaya Başla"**
4. Kamera izni ver
5. QR kodu ekrana göster veya yazdır
6. Tara!

✅ **Başarılı tarama:** Yeşil onay + isim gösterilir

---

## 🎯 Test Senaryosu

Tam test için:

```bash
# 1. Sample data ekle (backend/src/scripts/seed.js oluştur)
node backend/src/scripts/seed.js

# 2. Backend başlat
cd backend && npm run dev

# 3. Admin paneli: http://localhost:3000
# 4. Scanner: http://localhost:3000/scanner
```

---

## ❓ Sorun Giderme

### Port 3000 kullanımda
```bash
# Port'u değiştir
PORT=3001 node backend/src/server.js
```

### Database hatası
```bash
# Database'i sil ve yeniden oluştur
rm database/yoklama.db
npm run init-db
```

### Dependencies hatası
```bash
# Node modules'ları temizle
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Telefon bağlanamıyor
- Bilgisayar ve telefon aynı WiFi'de mi?
- Firewall 3000 portunu engelliyor mu?
- IP adresini doğru yazdınız mı?

---

## 📚 Daha Fazla Bilgi

- [README.md](README.md) - Tam döküman
- [API.md](docs/API.md) - API referansı
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [EXCEL_FORMAT.md](docs/EXCEL_FORMAT.md) - Excel import formatı

---

## 🎉 Başarılı!

Sistem hazır! Sorularınız için issue açın.
