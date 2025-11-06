@echo off
TITLE Telefon Baglantisi - Garantili Cozum
color 0E
echo.
echo ========================================
echo   TELEFON BAGLANTISI FIX
echo ========================================
echo.
echo Bu script tum engelleri kaldiriyor.
echo.
pause

echo.
echo [1/4] Firewall Kapatiliyor (Gecici Test)...
netsh advfirewall set allprofiles state off
echo [OK] Firewall kapandi
echo.

echo [2/4] Port 3000 Kontrolu...
netstat -ano | findstr :3000
echo.

echo [3/4] Tum IP Adresleri:
ipconfig | findstr "IPv4"
echo.

echo [4/4] Test Adresleri:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo TELEFONDA DENE: http://%%a:3000/test
)
echo.

echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo Firewall KAPANDI (test icin)
echo Simdi telefondan yukaridaki adreslerden birini dene!
echo.
echo Test bittikten sonra Firewall'u AC:
echo Windows Guvenlik - Guvenlik Duvari - AC
echo.
pause
