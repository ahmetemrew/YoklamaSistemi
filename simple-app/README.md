# 📋 Yoklama Sistemi - Basit Versiyon

Tek tıkla kurulabilen, QR kod tabanlı yoklama sistemi.

## 🚀 Hızlı Başlangıç

### 1. Setup.exe Oluştur

```bash
build-setup.bat
```

Bu komut:
- Dependencies yükler (~5 dakika)
- Windows installer oluşturur (~3 dakika)
- `dist/Yoklama Sistemi Setup 1.0.0.exe` dosyasını üretir

### 2. Kurulum Yap

1. `dist` klasörüne git
2. `Yoklama Sistemi Setup 1.0.0.exe` dosyasını çalıştır
3. Kurulum adımlarını takip et
4. Masaüstünden "Yoklama Sistemi" ikonuna tıkla

### 3. Kullanım

Program otomatik olarak tarayıcıda açılır:

**Ana Sayfa:**
- [📋 Yönet] - Etkinlik oluştur/düzenle
- [📱 Yoklama Al] - Canlı tarama başlat

## 📖 Nasıl Kullanılır?

### Etkinlik Oluşturma

1. **"Yönet"** butonuna tıkla
2. **"+ Yeni Etkinlik"** butonuna tıkla
3. Etkinlik bilgilerini gir:
   - Ad: Etkinlik adı
   - Tarih: Tarih seç
   - Katılımcılar: Excel yükle veya manuel ekle
4. **"Oluştur ve QR Kodları Üret"** butonuna tıkla
5. QR kodları otomatik olarak ZIP dosyası halinde indirilir

### Excel Formatı

Excel dosyanızda şu kolonlar olmalı:

| name | email | phone |
|------|-------|-------|
| Ali Yılmaz | ali@example.com | 5551234567 |
| Ayşe Demir | ayse@example.com | 5559876543 |

### Yoklama Alma

1. **"Yoklama Al"** butonuna tıkla
2. Etkinliği seç ve **"Başlat"** butonuna tıkla
3. Ekranda QR kod ve bağlantı adresi görünür
4. Telefonlardan bu adrese bağlan:
   - Tarayıcıda adresi aç VEYA
   - QR kodu tarat
5. Telefon kamerası açılır, QR kodları tara
6. Canlı olarak bilgisayar ekranında gözükür
7. Bitince **"Durdur ve Kaydet"** butonuna tıkla
8. İstatistikler gösterilir ve CSV indirilir

## 🔧 Sorun Giderme

### Build Hatası (better-sqlite3)

**Hata:** `Could not find Visual Studio installation`

**Çözüm:**
1. Visual Studio Build Tools yükle: https://aka.ms/vs/17/release/vs_BuildTools.exe
2. "Desktop development with C++" seçeneğini işaretle
3. Bilgisayarı yeniden başlat
4. `build-setup.bat` dosyasını tekrar çalıştır

### Telefon Bağlanamıyor

**Sorun:** Telefon tarayıcıda adres açılmıyor

**Çözümler:**
- Bilgisayar ve telefon aynı WiFi ağında olmalı
- Windows Firewall port 3000'i açmalı
- Antivirüs geçici olarak kapatılmalı

### QR Kodları İndirilmiyor

**Sorun:** "Oluştur" butonuna bastıktan sonra ZIP indirmiyor

**Çözüm:**
- Tarayıcı indirme izni vermiş olmalı
- Pop-up blocker kapalı olmalı
- Downloads klasörü yazılabilir olmalı

## 📊 Özellikler

✅ **Kolay Kurulum:** Tek .exe dosyası
✅ **Manuel/Excel İmport:** İstediğin gibi ekle
✅ **Otomatik QR:** ZIP halinde toplu indir
✅ **Canlı Tarama:** Real-time görüntüleme
✅ **İstatistikler:** Kim geldi, kim gelmedi
✅ **CSV Export:** Excel'de açılabilir rapor
✅ **Offline Çalışma:** İnternet gerektirmez

## 🗂️ Dosyalar

```
simple-app/
├── build-setup.bat          # Setup oluşturucu
├── package.json             # Dependencies
├── electron-main.js         # Electron ana dosya
├── backend-server.js        # Backend server
├── index.html               # Frontend UI
├── app.js                   # Frontend logic
├── icon.ico                 # Uygulama ikonu
└── dist/                    # Build çıktısı (oluşturulacak)
    └── Yoklama Sistemi Setup 1.0.0.exe
```

## 💾 Veri Depolama

Veriler şu konumda saklanır:
```
C:\Users\[KullaniciAdi]\AppData\Local\Yoklama Sistemi\yoklama.db
```

Yedeklemek için bu dosyayı kopyalayın.

## 🔄 Güncelleme

Yeni versiyon için:
1. Mevcut uygulamayı kaldır (Veriler silinmez)
2. Yeni setup.exe dosyasını çalıştır
3. Kurulum yap

## 📞 Destek

Sorun yaşarsan:
- README.md'yi oku
- WINDOWS_BUILD_FIX.md dosyasına bak
- GitHub'da issue aç

## 🎉 İyi Kullanımlar!

Yoklama işlemleriniz artık çok daha kolay!
