# 📋 Yoklama Sistemi - Tek .EXE Versiyonu

Tek dosya, çift tık çalışır!

## 🚀 Hızlı Başlangıç

### 1. .EXE Oluştur

```bash
build-exe.bat
```

**Süre:** ~5-8 dakika
**Çıktı:** `YoklamaSistemi.exe` (~80-100 MB)

### 2. Kullan

1. `YoklamaSistemi.exe` dosyasını çift tıkla
2. Tarayıcı otomatik açılır
3. Bitti! ✅

## 📦 İçerik

- **Tek .exe** dosyası
- Backend server dahili
- SQLite database dahili
- Tüm frontend dahili
- Kurulum gerektirmez

## 💾 Veri Konumu

```
C:\Users\[KullaniciAdi]\YoklamaSistemi\yoklama.db
```

## 🔧 Sorun Giderme

### better-sqlite3 build hatası

**Çözüm 1:** Visual Studio Build Tools
```
https://aka.ms/vs/17/release/vs_BuildTools.exe
"Desktop development with C++" seç
```

**Çözüm 2:** Node.js 18 LTS kullan
```
https://nodejs.org/ (LTS versiyonu)
```

### pkg native module hatası

`pkg` bazı native modulleri desteklemez. Bu durumda:

**Alternatif:** `simple-app` klasöründeki Electron versiyonunu kullan.

## ⚡ Avantajlar

✅ Tek dosya
✅ Kurulum yok
✅ Taşınabilir
✅ Hızlı başlangıç
✅ ~80-100 MB

## 📊 Teknik Detaylar

- **Tool:** pkg (Vercel)
- **Node:** v18 (embedded)
- **Platform:** Windows x64
- **Compression:** GZip
- **Port:** 3000

## 🎯 Kullanım

```
YoklamaSistemi.exe
   ↓
Tarayıcı açılır: http://localhost:3000
   ↓
[Yönet] veya [Yoklama Al]
```

## 📞 Destek

Sorun yaşarsan:
- Build hatası → WINDOWS_BUILD_FIX.md
- Kullanım → simple-app/KULLANIM.md
- Genel → README.md

---

**İyi kullanımlar!** 🚀
