@echo off
TITLE Yoklama Sistemi
color 0A

echo.
echo ==========================================
echo           YOKLAMA SISTEMI
echo ==========================================
echo.

REM Node.js kontrolu
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [HATA] Node.js bulunamadi!
    echo.
    echo Lutfen Node.js yukleyin:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM node_modules kontrolu
if not exist "node_modules" (
    echo [1/3] Ilk kullanimda dependencies yukleniyor...
    echo Bu sadece bir kez yapilacak ^(2-3 dakika^)
    echo.
    call npm install --silent
    if errorlevel 1 (
        echo.
        echo [HATA] Dependencies yukleme hatasi!
        pause
        exit /b 1
    )
    echo [OK] Dependencies yuklendi
    echo.
)

REM Firewall kontrolu ve kurulum
echo [2/3] Firewall kontrol ediliyor...
netsh advfirewall firewall show rule name="Yoklama Sistemi - HTTPS" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Firewall kurallari bulunamadi, otomatik ekleniyor...
    netsh advfirewall firewall add rule name="Yoklama Sistemi - HTTPS" dir=in action=allow protocol=TCP localport=3443 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Firewall kurallari eklendi
    ) else (
        echo [UYARI] Firewall kurallari eklenemedi - yonetici olarak calistirin
    )
) else (
    echo [OK] Firewall kurallari mevcut
)
echo.

REM Server'i baslat
echo [3/3] Server baslatiliyor...
echo.
echo ==========================================
echo    HAZIR! Tarayici otomatik acilacak
echo ==========================================
echo.
echo Admin Panel: http://localhost:3000
echo.
echo KAPATMAK ICIN: Bu pencereyi kapat veya Ctrl+C
echo.
echo ==========================================
echo.

start http://localhost:3000

node server.js

pause
