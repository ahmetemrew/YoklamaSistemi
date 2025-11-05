# 📊 Excel Import Format

## Desteklenen Dosya Formatları

- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (Comma-separated values)

## Gerekli Kolonlar

En az **1 kolon** zorunlu: `name` veya `Name` veya `ad` veya `Ad` veya `İsim`

## Tüm Kolonlar

| Kolon Adı (İngilizce) | Kolon Adı (Türkçe) | Zorunlu | Açıklama |
|----------------------|-------------------|---------|----------|
| `name` / `Name` | `ad` / `Ad` / `İsim` | ✅ Evet | Katılımcı adı soyadı |
| `email` / `Email` | `eposta` / `E-posta` | ❌ Hayır | Email adresi |
| `phone` / `Phone` | `telefon` / `Telefon` | ❌ Hayır | Telefon numarası |
| `identifier` / `ID` | `kimlik` / `tc` | ❌ Hayır | Benzersiz kimlik (yoksa otomatik) |

## Örnek Excel Dosyaları

### Format 1: Sadece İsim (Minimum)

| name |
|------|
| Ali Yılmaz |
| Ayşe Demir |
| Mehmet Kaya |

### Format 2: İsim + Email

| Name | Email |
|------|-------|
| Ali Yılmaz | ali.yilmaz@example.com |
| Ayşe Demir | ayse.demir@example.com |
| Mehmet Kaya | mehmet.kaya@example.com |

### Format 3: Tam Format

| name | email | phone | identifier |
|------|-------|-------|-----------|
| Ali Yılmaz | ali.yilmaz@example.com | 05551234567 | 12345 |
| Ayşe Demir | ayse.demir@example.com | 05559876543 | 12346 |
| Mehmet Kaya | mehmet.kaya@example.com | 05557654321 | 12347 |

### Format 4: Türkçe Kolonlar

| Ad | E-posta | Telefon |
|----|---------|---------|
| Ali Yılmaz | ali@ornek.com | 0555 123 45 67 |
| Ayşe Demir | ayse@ornek.com | 0555 987 65 43 |

## İçe Aktarma Adımları

1. Excel dosyanızı yukarıdaki formatlardan birine uygun hazırlayın
2. Admin panelinde etkinlik detay sayfasına gidin
3. **"📤 Excel İçe Aktar"** butonuna tıklayın
4. Dosyanızı seçin
5. Yükleme tamamlanınca sonuç gösterilir:
   - ✅ Kaç katılımcı başarıyla eklendi
   - ❌ Kaç hata oluştu (varsa)

## Hata Durumları

### 1. Duplicate (Tekrarlayan) Kayıt
```
❌ Ali Yılmaz - Hata: Bu katılımcı zaten kayıtlı
```

**Çözüm**:
- Kişiyi Excel'den çıkar
- Veya sistemdeki kaydı sil

### 2. Geçersiz Email Format
Email formatı otomatik kontrol edilmez, ancak geçersiz format sorun çıkarabilir.

**Örnek Geçerli:**
- `ali@example.com` ✅
- `ayse.demir@firma.com.tr` ✅

**Örnek Geçersiz:**
- `ali@` ❌
- `@example.com` ❌

### 3. Boş Satırlar
Excel'deki boş satırlar otomatik atlanır.

### 4. İsim Eksik
```
❌ Satır 5 - Hata: İsim alanı zorunludur
```

**Çözüm**: İsim kolonunu doldurun

## CSV Format

CSV dosyası kullanıyorsanız:

```csv
name,email,phone
Ali Yılmaz,ali@example.com,05551234567
Ayşe Demir,ayse@example.com,05559876543
Mehmet Kaya,mehmet@example.com,05557654321
```

**Not:**
- İlk satır kolon başlıkları olmalı
- Virgül (,) ile ayrılmış
- Türkçe karakter varsa UTF-8 encoding kullanın

## Excel Template İndirme

Hazır template dosyası:

| Dosya | İndir |
|-------|-------|
| Minimum Format | [katilimci_min.xlsx](../templates/katilimci_min.xlsx) |
| Tam Format | [katilimci_tam.xlsx](../templates/katilimci_tam.xlsx) |
| CSV Format | [katilimci.csv](../templates/katilimci.csv) |

## Tips & Tricks

### 1. Çok Sayıda Katılımcı (1000+)
- Excel yerine CSV kullanın (daha hızlı)
- Batch'lere ayırın (her seferinde 500)

### 2. Özel Karakterler
Türkçe karakterler (ğ, ü, ş, ı, ç, ö) desteklenir. UTF-8 encoding kullanın.

### 3. Telefon Formatı
Tüm formatlar kabul edilir:
- `05551234567` ✅
- `0555 123 45 67` ✅
- `+90 555 123 45 67` ✅
- `5551234567` ✅

### 4. Identifier (Kimlik)
- Eğer siz belirtmezseniz sistem otomatik UUID üretir
- Öğrenci No, TC No, veya herhangi benzersiz ID kullanabilirsiniz
- Aynı identifier iki kez kullanılamaz

## Programatik Import (API)

Excel UI yerine API kullanmak isterseniz:

```javascript
const formData = new FormData();
formData.append('file', excelFile);
formData.append('eventId', eventId);

fetch('/api/participants/import', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log(`${data.results.filter(r => r.success).length} kişi eklendi`);
});
```

## Örnek Node.js Script

```javascript
const XLSX = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const workbook = XLSX.readFile('katilimcilar.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const formData = new FormData();
formData.append('file', fs.createReadStream('katilimcilar.xlsx'));
formData.append('eventId', 1);

axios.post('http://localhost:3000/api/participants/import', formData, {
  headers: formData.getHeaders()
})
.then(res => console.log(res.data))
.catch(err => console.error(err));
```
