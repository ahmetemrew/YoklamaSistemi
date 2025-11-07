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
    echo [UYARI] Node.js bulunamadi!
    echo.
    echo Node.js otomatik yuklenecek...
    echo.

    REM Node.js installer indir
    echo [1/4] Node.js indiriliyor... ^(~30MB, lutfen bekleyin^)
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\nodejs.msi'}"

    if errorlevel 1 (
        echo.
        echo [HATA] Node.js indirilemedi!
        echo Internet baglantinizi kontrol edin.
        echo.
        echo Manuel yukleme icin: https://nodejs.org/
        pause
        exit /b 1
    )

    echo [2/4] Node.js kuruluyor... ^(lutfen bekleyin^)
    msiexec /i "%TEMP%\nodejs.msi" /qn /norestart

    if errorlevel 1 (
        echo.
        echo [HATA] Node.js kurulamadi!
        echo Manuel olarak yukleyin: https://nodejs.org/
        pause
        exit /b 1
    )

    REM PATH'i yenile
    echo [3/4] Sistem degiskenleri guncelleniyor...
    call refreshenv.cmd 2>nul

    REM Node.js PATH'e ekle (aninda kullanim icin)
    set "PATH=%PATH%;%ProgramFiles%\nodejs"

    echo [4/4] Node.js kurulumu tamamlandi!
    echo.

    REM Temp dosyayi sil
    del "%TEMP%\nodejs.msi" 2>nul

    echo Node.js basariyla kuruldu!
    echo Sistem yeniden baslatiliyor...
    echo.
    timeout /t 3 >nul

    REM Scripti yeniden baslat
    start "" "%~f0"
    exit
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

REM Firewall kontrolu ve kurulum
echo [2/2] Firewall kontrol ediliyor...
netsh advfirewall firewall show rule name="Yoklama Sistemi" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Firewall kurallari bulunamadi, otomatik ekleniyor...
    netsh advfirewall firewall add rule name="Yoklama Sistemi" dir=in action=allow protocol=TCP localport=3000 >nul 2>nul
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
echo.
echo Server baslatiliyor...
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
