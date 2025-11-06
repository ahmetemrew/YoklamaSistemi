@echo off
TITLE Yoklama Sistemi - Baslat
color 0A

echo.
echo ==========================================
echo       YOKLAMA SISTEMI BASLATIYOR
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
    echo [1/2] Ilk kullanimda dependencies yukleniyor...
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

REM Server'i baslat
echo [2/2] Server baslatiliyor...
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
