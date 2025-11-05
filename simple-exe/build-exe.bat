@echo off
REM ==========================================
REM   TEK .EXE OLUŞTURUCU - YOKLAMA SİSTEMİ
REM ==========================================

echo.
echo ==========================================
echo    Yoklama Sistemi - Tek EXE Olusturucu
echo ==========================================
echo.
echo Bu islem 5-8 dakika surebilir...
echo.

REM Temizlik
echo [1/4] Temizlik yapiliyor...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
if exist YoklamaSistemi.exe del /q YoklamaSistemi.exe
echo [OK] Temizlik tamamlandi
echo.

REM better-sqlite3 prebuilt
echo [2/4] better-sqlite3 yukleniyor (prebuilt)...
call npm install better-sqlite3@11.5.0 --build-from-source=false

if errorlevel 1 (
    echo.
    echo [HATA] better-sqlite3 yukleme hatasi!
    echo.
    echo Cozum 1: Visual Studio Build Tools yukle
    echo   https://aka.ms/vs/17/release/vs_BuildTools.exe
    echo   "Desktop development with C++" secenegini isaretle
    echo.
    echo Cozum 2: Node.js 18 LTS kullan (20+ yerine)
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] better-sqlite3 yuklendi
echo.

REM Diger dependencies
echo [3/4] Diger dependencies yukleniyor...
call npm install

if errorlevel 1 (
    echo.
    echo [HATA] Dependencies yukleme hatasi!
    pause
    exit /b 1
)

echo [OK] Dependencies yuklendi
echo.

REM pkg ile .exe olustur
echo [4/4] TEK .EXE olusturuluyor...
echo.
echo Bu adim en uzun suren kisim (3-5 dakika)
echo Lutfen bekleyin...
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo [HATA] EXE olusturma hatasi!
    echo.
    echo Muhtemel sebep: pkg native modules desteklemiyor
    echo Cozum: portable klasor versiyonunu kullanin
    echo.
    pause
    exit /b 1
)

REM Kontrol
if not exist YoklamaSistemi.exe (
    echo.
    echo [HATA] YoklamaSistemi.exe olusturulamadi!
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo        TEK .EXE HAZIR!
echo ==========================================
echo.
echo Dosya: YoklamaSistemi.exe
echo Boyut: ~80-100 MB
echo.
echo KULLANIM:
echo   1. YoklamaSistemi.exe dosyasini cift tikla
echo   2. Tarayici otomatik acilir
echo   3. Yonet veya Yoklama Al butonlarina tikla
echo.
echo NOT:
echo   - Ilk acilis 5-10 saniye surebilir
echo   - Database: C:\Users\[Kullanici]\YoklamaSistemi\yoklama.db
echo   - Port 3000 kullaniyor
echo.
pause
