@echo off
TITLE Telefon Baglanti Testi
color 0A
echo.
echo ========================================
echo   TELEFON BAGLANTI TESTI
echo ========================================
echo.
echo Bu script telefon baglantisini test eder.
echo.
pause

echo.
echo [1/5] Network Interface Bilgileri
echo ========================================
ipconfig | findstr /i "IPv4 Wireless Ethernet"
echo.

echo.
echo [2/5] Firewall Durumu Kontrol Ediliyor
echo ========================================
netsh advfirewall show allprofiles state
echo.

echo.
echo [3/5] Port 3000 Dinleniyor mu?
echo ========================================
netstat -ano | findstr :3000
echo.

echo.
echo [4/5] Firewall Rule Kontrol
echo ========================================
netsh advfirewall firewall show rule name="Yoklama Sistemi - Gelen"
echo.

echo.
echo [5/5] IP Adreslerini Listele
echo ========================================
echo Asagidaki IP adreslerinden birini telefonunda dene:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo http://%%a:3000/test
)
echo.

echo.
echo ========================================
echo   SONUC
echo ========================================
echo.
echo 1. Yukaridaki IP adreslerinden birini kopyala
echo 2. Telefonunda Chrome/Safari'yi ac
echo 3. O adresi yaz (http:// ile baslamali!)
echo 4. "BAGLANTI BASARILI" gormelisin
echo.
echo Hala baglanamiyorsan:
echo - FIREWALL_AYARLARI.bat'i yonetici olarak calistir
echo - Windows Defender Firewall'u tamamen kapat (gecici test)
echo - Farkli bir Wi-Fi ag dene
echo.
pause
