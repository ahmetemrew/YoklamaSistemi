# 📋 Yoklama Sistemi

Modern, QR kod tabanlı, yeniden kullanılabilir yoklama/attendance sistemi.

## ✨ Özellikler

- 🎯 **Çoklu Etkinlik Desteği**: Sınırsız etkinlik oluşturun, her biri bağımsız olarak yönetilebilir
- 📱 **Mobil QR Okuyucu**: 5+ telefon/tablet aynı anda QR kod okuyabilir
- 💻 **Masaüstü Admin Panel**: Tek .exe dosyası, kurulum gerektirmez
- ⚡ **Gerçek Zamanlı Güncelleme**: Socket.io ile anlık yoklama bildirimleri
- 📊 **Detaylı Raporlar**: Katılım istatistikleri, export özellikleri
- 📥 **Excel İçe Aktarma**: Toplu katılımcı ekleme
- 🎫 **QR Kod Üretimi**: Otomatik QR kod oluşturma ve toplu indirme (ZIP)
- 🔄 **Offline Destek**: Internet kesilse bile çalışmaya devam eder
- 🌐 **Local Network**: WiFi üzerinden tüm cihazlar bağlanır

## 🏗️ Mimari

```
┌─────────────────────────┐
│   💻 Ana Bilgisayar     │
│   YoklamaSistemi.exe    │
│   ├── Backend (Node.js) │
│   ├── Database (SQLite) │
│   └── Admin Panel       │
└────────────┬────────────┘
             │ Local Network (WiFi/LAN)
      ┌──────┴──────┬──────┬──────┬──────┐
      📱          📱     📱     📱     📱
    Telefon 1-5 (QR Scanner - Browser)
```

## 🚀 Kurulum

### Geliştirici Kurulumu

```bash
# 1. Repository'yi klonla
git clone <repo-url>
cd YoklamaSistemi

# 2. Backend dependencies
cd backend
npm install

# 3. Frontend dependencies
cd ../frontend
npm install

# 4. Root dependencies (Electron)
cd ..
npm install

# 5. Database'i başlat
cd backend
npm run init-db
```

### Geliştirme Modu

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Electron (Opsiyonel):
```bash
npm run electron:dev
```

## 📦 Build ve Dağıtım

### Üretim Build

```bash
# 1. Frontend'i build et
cd frontend
npm run build

# 2. Electron .exe oluştur
cd ..
npm run electron:build

# 3. Çıktı: release/YoklamaSistemi-Setup.exe
```

### .exe Dosyasını Kullanma

1. `YoklamaSistemi-Setup.exe` dosyasını çift tıkla
2. Kurulum tamamlanınca program otomatik açılır
3. Admin paneli: `http://localhost:3000`
4. Scanner URL: `http://[BİLGİSAYAR-IP]:3000/scanner`

## 📱 Telefon Bağlantısı

1. Ana bilgisayarda programı çalıştır
2. Konsol/terminal'de gösterilen IP adresini not al:
   ```
   📡 Telefonlardan bağlanmak için:
      http://192.168.1.100:3000/scanner
   ```
3. Telefonlarda browser'ı aç ve bu URL'ye git
4. Cihaz adı gir (Örn: "Giriş Kapısı", "Telefon 1")
5. Kamera izni ver
6. QR taramaya başla!

## 📖 Kullanım Kılavuzu

### 1. Etkinlik Oluşturma

1. Admin panelinde **"Etkinlikler"** sekmesine git
2. **"+ Yeni Etkinlik"** butonuna tıkla
3. Formu doldur:
   - Etkinlik adı (zorunlu)
   - Tarih (zorunlu)
   - Açıklama, lokasyon (opsiyonel)
   - Çoklu tarama izni (checkbox)
4. **"Oluştur"** butonuna tıkla

### 2. Katılımcı Ekleme

#### Excel ile Toplu Ekleme (Önerilen)

1. Etkinlik detay sayfasına git
2. Excel dosyası hazırla (örnek format):
   ```
   | name          | email              | phone       |
   |---------------|-------------------|-------------|
   | Ali Yılmaz    | ali@example.com   | 5551234567  |
   | Ayşe Demir    | ayse@example.com  | 5559876543  |
   ```
3. **"📤 Excel İçe Aktar"** butonuna tıkla
4. Dosyayı seç ve yükle

#### Tek Tek Ekleme

1. API endpoint'ini kullan: `POST /api/participants`
2. Body:
   ```json
   {
     "event_id": 1,
     "name": "Ali Yılmaz",
     "email": "ali@example.com",
     "phone": "5551234567"
   }
   ```

### 3. QR Kod İndirme

1. Etkinlik detay sayfasında **"📥 QR Kodları İndir"** butonuna tıkla
2. ZIP dosyası indirilecek
3. ZIP'i aç, her katılımcı için PNG dosyası var
4. Yazdır veya dijital olarak dağıt

### 4. Yoklama Tarama

1. Telefonda scanner sayfasını aç
2. **"🎥 Taramaya Başla"** butonuna tıkla
3. Kamera izni ver
4. QR kodu kameraya tut
5. Yeşil ✓ işareti: Başarılı tarama
6. Sarı ⚠ işareti: Daha önce taranmış
7. Kırmızı ✗ işareti: Geçersiz QR

### 5. Raporlama

1. Etkinlik detay sayfasında istatistikler görünür:
   - Toplam katılımcı
   - Geldi
   - Gelmedi
   - Katılım oranı (%)
2. **"Yoklama Kayıtları"** sekmesinde tüm taramalar listelenir
3. Excel export için (gelecek özellik)

## 🗄️ Database Yapısı

### Events (Etkinlikler)
- `id`, `name`, `description`, `date`, `location`
- `is_active`: Etkinlik aktif mi?
- `allow_multiple_scans`: Çoklu tarama izni
- `settings`: JSON - esnek ayarlar

### Participants (Katılımcılar)
- `id`, `event_id`, `name`, `email`, `phone`
- `qr_code_data`: Benzersiz QR kod
- `metadata`: JSON - ekstra bilgiler

### Attendance (Yoklama Kayıtları)
- `id`, `participant_id`, `device_id`, `device_name`
- `scanned_at`: Tarama zamanı
- `scan_type`: entry/exit

### Devices (Cihazlar)
- `id`, `name`, `type`, `is_online`
- `last_active`: Son aktivite zamanı

## 🔧 API Endpoints

### Events
- `GET /api/events` - Tüm etkinlikler
- `GET /api/events/active` - Aktif etkinlikler
- `GET /api/events/:id` - Etkinlik detayı
- `POST /api/events` - Yeni etkinlik
- `PUT /api/events/:id` - Güncelle
- `DELETE /api/events/:id` - Sil

### Participants
- `GET /api/events/:eventId/participants` - Etkinlik katılımcıları
- `POST /api/participants` - Yeni katılımcı
- `POST /api/participants/import` - Excel import
- `GET /api/events/:eventId/qrcodes` - QR kodları indir (ZIP)

### Attendance
- `POST /api/attendance/scan` - QR tarama
- `GET /api/events/:eventId/attendance` - Etkinlik yoklama kayıtları
- `GET /api/attendance/recent` - Son taramalar

### Devices
- `GET /api/devices` - Tüm cihazlar
- `GET /api/devices/online` - Online cihazlar
- `POST /api/devices/register` - Cihaz kaydet

## 🛠️ Teknolojiler

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- Socket.io (real-time)
- QRCode (üretim)
- XLSX (Excel işleme)

### Frontend
- React 18
- Vite (build tool)
- React Router (routing)
- html5-qrcode (tarama)
- Socket.io-client

### Desktop
- Electron (Windows .exe)

## 🐛 Troubleshooting

### Server başlamıyor
```bash
cd backend
npm run init-db  # Database'i yeniden başlat
npm run dev
```

### Telefon bağlanamıyor
- Bilgisayar ve telefon aynı WiFi ağında mı?
- Firewall QR okuyucu port 3000'i engelliyor mu?
- IP adresini doğru girdiniz mi?

### QR kodlar üretilmiyor
```bash
cd backend
npm install qrcode archiver --save
```

### Kamera açılmıyor (telefon)
- Browser'da kamera izni verildi mi?
- HTTPS gerekebilir (production'da)

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici

Proje geliştiriciye ait değildir. İhtiyacınıza göre özelleştirebilirsiniz.

## 🔜 Gelecek Özellikler

- [ ] Excel export (katılım raporu)
- [ ] PDF rapor üretimi
- [ ] SMS/Email bildirimleri
- [ ] Çoklu dil desteği
- [ ] Dark mode
- [ ] Kullanıcı yönetimi (admin/operator)
- [ ] Entegrasyon API'leri
- [ ] Mobile native app (React Native)

## 📞 Destek

Sorun bildirmek için issue açabilirsiniz.
