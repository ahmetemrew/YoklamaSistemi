@echo off
TITLE Yoklama Sistemi - HTTPS Mode (Hizli Kamera)
color 0A

echo.
echo ==========================================
echo    YOKLAMA SISTEMI - HTTPS MODU
echo ==========================================
echo.
echo  HIZLI KAMERA OKUMA ICIN!
echo  300 kisi icin ideal - kamera aninda acilir
echo.
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
    echo [1/4] Ilk kullanimda dependencies yukleniyor...
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
echo [2/4] Firewall kontrol ediliyor...
netsh advfirewall firewall show rule name="Yoklama Sistemi - Gelen" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Firewall kurallari bulunamadi, otomatik ekleniyor...
    netsh advfirewall firewall add rule name="Yoklama Sistemi - Gelen" dir=in action=allow protocol=TCP localport=3000 >nul 2>nul
    netsh advfirewall firewall add rule name="Yoklama Sistemi - Giden" dir=out action=allow protocol=TCP localport=3000 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Firewall kurallari eklendi
    ) else (
        echo [UYARI] Firewall kurallari eklenemedi
    )
) else (
    echo [OK] Firewall kurallari mevcut
)
echo.

echo [3/4] HTTPS Tunnel baslatiliyor...
echo.
echo ==========================================
echo   LUTFEN BEKLEYIN - TUNNEL ACILIYOR
echo ==========================================
echo.

REM HTTPS Tunnel aktif et
set USE_TUNNEL=true

echo [4/4] Server baslatiliyor...
echo.

node server.js

pause
