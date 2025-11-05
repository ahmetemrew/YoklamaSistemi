# 🎯 YOKLAMA SİSTEMİ - KULLANIM KILAVUZU

## 📦 Kurulum

### Adım 1: Setup Dosyası Oluştur

```bash
# simple-app klasörüne git
cd simple-app

# Build script'i çalıştır
build-setup.bat
```

**Süre:** ~5-10 dakika
**Çıktı:** `dist/Yoklama Sistemi Setup 1.0.0.exe`

### Adım 2: Programı Kur

1. `dist` klasörünü aç
2. `Yoklama Sistemi Setup 1.0.0.exe` dosyasını çift tıkla
3. Kurulum sihirbazını takip et:
   - "İleri" butonuna tıkla
   - Kurulum klasörünü seç (varsayılan: `C:\Program Files\Yoklama Sistemi`)
   - "Kur" butonuna tıkla
   - Bekle (~30 saniye)
   - "Bitir" butonuna tıkla

### Adım 3: Programı Başlat

Masaüstünde **"Yoklama Sistemi"** ikonuna çift tıkla.

Program otomatik olarak tarayıcıda açılacak: `http://localhost:3000`

---

## 🎨 Ana Ekran

İlk açılışta iki büyük buton göreceksin:

```
╔════════════════════════════════╗
║    📋 Yoklama Sistemi          ║
╠════════════════════════════════╣
║                                ║
║   [📋 Yönet]   [📱 Yoklama]   ║
║                                ║
╚════════════════════════════════╝
```

---

## 📋 ETKİNLİK OLUŞTURMA

### 1. Yönet Butonuna Tıkla

**"📋 Yönet"** butonuna tıkla.

### 2. Yeni Etkinlik Oluştur

**"+ Yeni Etkinlik"** butonuna tıkla.

### 3. Bilgileri Doldur

**Etkinlik Adı:**
```
Örnek: Konferans 2024
```

**Tarih:**
```
Bugünün tarihi otomatik seçili
İstersen değiştirebilirsin
```

**Katılımcı Ekleme Yöntemi:**

#### Yöntem A: Excel/CSV Yükle (Önerilen)

1. **"Excel/CSV Yükle"** seçeneğini işaretle
2. **"Dosya seçmek için tıklayın"** kutusuna tıkla
3. Excel dosyanı seç

**Excel Formatı:**

| name | email | phone |
|------|-------|-------|
| Ali Yılmaz | ali@example.com | 5551234567 |
| Ayşe Demir | ayse@example.com | 5559876543 |
| Mehmet Kaya | mehmet@example.com | 5557654321 |

**Not:**
- İlk satır başlık olmalı
- `name` kolonu zorunlu
- `email` ve `phone` opsiyonel

#### Yöntem B: Manuel Ekle

1. **"Manuel Ekle"** seçeneğini işaretle
2. Metin kutusuna her satıra bir isim yaz:

```
Ali Yılmaz
Ayşe Demir
Mehmet Kaya
```

### 4. Oluştur ve QR Üret

**"✅ Oluştur ve QR Kodları Üret"** butonuna tıkla.

**Ne Olur:**
1. Etkinlik oluşturulur (~1 saniye)
2. Katılımcılar eklenir (~2-5 saniye)
3. QR kodları oluşturulur (~5-10 saniye)
4. ZIP dosyası otomatik indirilir

**İndirilen Dosya:**
```
Konferans_2024_QR_Kodlari.zip
```

ZIP içinde her katılımcı için bir PNG dosyası var:
```
1_Ali_Yilmaz.png
2_Ayse_Demir.png
3_Mehmet_Kaya.png
```

### 5. QR Kodları Yazdır

ZIP'i aç ve PNG dosyalarını yazdır veya email ile gönder.

**Önerilen Boyut:** 5cm x 5cm

---

## 📱 YOKLAMA ALMA

### 1. Etkinliği Başlat

Ana ekranda **"📱 Yoklama Al"** butonuna tıkla.

Etkinlikler listesi görünür. Başlatmak istediğin etkinliğin yanındaki **"▶️ Başlat"** butonuna tıkla.

### 2. Canlı Tarama Ekranı

Ekranda şunları göreceksin:

```
╔═══════════════════════════════════════╗
║ KONFERANS 2024 - CANLI TARAMA        ║
╠═══════════════════════════════════════╣
║                                       ║
║ 📱 Telefonlardan Bağlanın:           ║
║                                       ║
║ http://192.168.1.100:3000/scanner    ║
║                                       ║
║ [QR KOD BURADA]                       ║
║                                       ║
╠═══════════════════════════════════════╣
║ Canlı Taramalar:                      ║
║ ✅ Ali Yılmaz - 09:15                 ║
║ ✅ Ayşe Demir - 09:16                 ║
║ ⚠️  Mehmet Can - 09:17 (2. giriş)    ║
║                                       ║
║ Toplam: 3 / 300                       ║
╚═══════════════════════════════════════╝
```

### 3. Telefonlardan Bağlanma

**İki yöntem var:**

#### Yöntem A: Adres Yazma

1. Telefon tarayıcısını aç
2. Ekrandaki adresi yaz: `http://192.168.1.100:3000/scanner`
3. Enter'a bas

#### Yöntem B: QR Kod Taratma

1. Telefon kamerasını aç
2. Ekrandaki QR kodu tarat
3. Çıkan linke tıkla

**Önemli:** Telefon ve bilgisayar aynı WiFi ağında olmalı!

### 4. QR Kod Tarama

Telefonda kamera otomatik açılır:

```
╔════════════════════════╗
║   📱 QR Scanner        ║
╠════════════════════════╣
║                        ║
║   [KAMERA GÖRÜNTÜSÜ]   ║
║                        ║
╚════════════════════════╝
```

Katılımcının QR kodunu kameraya tut.

**Başarılı Tarama:**
```
╔════════════════════════╗
║ ✅ Başarılı!           ║
║ Ali Yılmaz             ║
║ yoklamaya kaydedildi   ║
╚════════════════════════╝
```

**İkinci Giriş:**
```
╔════════════════════════╗
║ ⚠️  Uyarı!             ║
║ Ali Yılmaz             ║
║ daha önce tarandı      ║
╚════════════════════════╝
```

**Geçersiz QR:**
```
╔════════════════════════╗
║ ❌ Hata!               ║
║ Geçersiz QR kod        ║
╚════════════════════════╝
```

### 5. Bilgisayarda Canlı İzleme

Her tarama anında bilgisayar ekranında görünür:

**İstatistikler:**
```
┌───────────────┬───────────────┬───────────────┐
│ Toplam: 300   │ Geldi: 245    │ Gelmedi: 55   │
│ Oran: %82     │               │               │
└───────────────┴───────────────┴───────────────┘
```

**Canlı Feed:**
```
✅ Ali Yılmaz - 09:15:32
✅ Ayşe Demir - 09:15:45
✅ Mehmet Kaya - 09:16:12
⚠️  Ali Yılmaz - 09:16:30 (2. giriş)
✅ Zeynep Aydın - 09:17:05
```

### 6. Taramayı Durdur

İşin bitince **"⏹ Durdur ve Kaydet"** butonuna tıkla.

**Ne Olur:**

1. **İstatistikler Gösterilir:**
```
📊 YOKLAMA İSTATİSTİKLERİ
=====================================

Etkinlik: Konferans 2024
Tarih: 15/06/2024

Toplam Katılımcı: 300
Geldi: 245
Gelmedi: 55
Katılım Oranı: 82%

Veriler kaydedildi: 15/06/2024 18:30
```

2. **CSV Dosyası İndirilir:**
```
Konferans_2024_Yoklama_2024-06-15.csv
```

CSV içeriği:
```csv
Ad Soyad,Email,Telefon,Durum,Tarih
Ali Yılmaz,ali@example.com,5551234567,Geldi,"15/06/2024 09:15:32"
Ayşe Demir,ayse@example.com,5559876543,Geldi,"15/06/2024 09:15:45"
Zeynep Yıldız,zeynep@example.com,,Gelmedi,""
```

3. **Ana Ekrana Dön:**

Ana sayfa tekrar açılır.

---

## 📊 VERİ YÖNETİMİ

### Veriler Nerede Saklanır?

```
C:\Users\[KullaniciAdi]\AppData\Local\Yoklama Sistemi\yoklama.db
```

### Yedekleme

1. Program kapalıyken `yoklama.db` dosyasını kopyala
2. Güvenli bir yere kaydet

### Geri Yükleme

1. Program kapalı olmalı
2. Yedek `yoklama.db` dosyasını yukarıdaki konuma kopyala
3. Programı aç

---

## 🔧 SORUN GİDERME

### Telefon Bağlanamıyor

**Sorun:** Tarayıcıda adres açılmıyor

**Çözümler:**

1. **Aynı WiFi kontrolü:**
   - Bilgisayar WiFi: ✅
   - Telefon WiFi: ✅
   - Aynı ağ: ✅

2. **Firewall kontrolü:**
   - Windows Güvenlik Duvarı → Gelişmiş Ayarlar
   - Gelen Kurallar → Yeni Kural
   - Port 3000'i aç

3. **IP doğrulama:**
   - CMD aç
   - `ipconfig` yaz
   - IPv4 adresini bul (örn: 192.168.1.100)
   - Telefonda bu IP'yi kullan

### QR Kodları İndirilmiyor

**Sorun:** "Oluştur" butonuna bastıktan sonra ZIP gelmiyor

**Çözümler:**

1. **Tarayıcı izinleri:**
   - Tarayıcı ayarları → İndirmeler
   - "Her indirmede sor" kapat
   - Otomatik indirmeyi aç

2. **Pop-up blocker:**
   - Tarayıcı ayarları → Gizlilik
   - Pop-up engellemeyi kapat

3. **Downloads klasörü:**
   - `C:\Users\[Kullanici]\Downloads` yazılabilir olmalı

### Excel Yüklenmiyor

**Sorun:** Dosya seçilince hata veriyor

**Çözümler:**

1. **Dosya formatı:**
   - .xlsx (Excel 2007+) ✅
   - .xls (Excel 97-2003) ✅
   - .csv ✅

2. **Kolon başlıkları:**
   - İlk satır: `name`, `email`, `phone`
   - Küçük harf olmalı

3. **Boş satırlar:**
   - Excel'de boş satırları sil
   - Son satırdan sonra boşluk olmasın

### Build Hatası

**Hata:** `Could not find Visual Studio installation`

**Çözüm:**

1. Visual Studio Build Tools yükle:
   - https://aka.ms/vs/17/release/vs_BuildTools.exe

2. Kurulumda seç:
   - ✅ Desktop development with C++

3. Bilgisayarı yeniden başlat

4. `build-setup.bat` tekrar çalıştır

---

## 💡 İPUÇLARI

### QR Kod Yazdırma

- **Boyut:** 5cm x 5cm ideal
- **Kalite:** 300 DPI önerilen
- **Kağıt:** Mat kağıt daha iyi okunur
- **Test:** Yazdırdıktan sonra telefon kamerasıyla test et

### WiFi Kurulumu

- **Sabit IP:** Router'da DHCP reservation yap
- **Güçlü Sinyal:** Router merkezi konumda olsun
- **Kanal:** Otomatik kanal seçimi aktif olsun

### Etkinlik Günü

1. **Sabah erkenden:**
   - Programı başlat
   - IP adresini not et
   - Test taraması yap

2. **Yedek telefon:**
   - En az 1 yedek telefon hazır bulundur
   - Powerbank al

3. **Yazdırılmış liste:**
   - Manuel kontrol için isim listesi yazdır
   - Elektrik kesilirse kullanılır

### Performans

- **Katılımcı sayısı:** 1000+ desteklenir
- **Eşzamanlı tarama:** 10 telefon rahat çalışır
- **Tarama hızı:** ~1 saniye/QR

---

## 📞 YARDIM

Sorun yaşarsan:

1. Bu dokümanı oku: `KULLANIM.md`
2. Windows sorunları için: `WINDOWS_BUILD_FIX.md`
3. Genel bilgi için: `README.md`
4. GitHub'da issue aç

---

## 🎉 İYİ KULANIMLAR!

Yoklama işlemlerin artık çok kolay! 🚀
