@echo off
REM ========================================
REM   YOKLAMA SİSTEMİ - SETUP OLUŞTURUCU
REM ========================================

echo.
echo ========================================
echo    Yoklama Sistemi Setup Olusturucu
echo ========================================
echo.
echo Bu islem 5-10 dakika surebilir...
echo.

REM Temizlik
echo [1/5] Onceki build temizleniyor...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
if exist dist rmdir /s /q dist
if exist yoklama.db del /q yoklama.db
echo [OK] Temizlik tamamlandi
echo.

REM better-sqlite3 with prebuilt binary
echo [2/5] better-sqlite3 yukleniyor (prebuilt)...
call npm install better-sqlite3@11.5.0 --build-from-source=false

if errorlevel 1 (
    echo.
    echo [HATA] better-sqlite3 yukleme hatasi!
    echo.
    echo Cozum: Visual Studio Build Tools yukleyin
    echo Indirme: https://aka.ms/vs/17/release/vs_BuildTools.exe
    echo.
    pause
    exit /b 1
)
echo [OK] better-sqlite3 yuklendi
echo.

REM Install other dependencies
echo [3/5] Diger dependencies yukleniyor...
call npm install

if errorlevel 1 (
    echo.
    echo [HATA] Dependencies yukleme hatasi!
    pause
    exit /b 1
)
echo [OK] Dependencies yuklendi
echo.

REM Build Electron
echo [4/5] Electron installer olusturuluyor...
echo Bu adim en uzun suren kisim (3-5 dakika)...
call npm run build

if errorlevel 1 (
    echo.
    echo [HATA] Electron build hatasi!
    pause
    exit /b 1
)
echo [OK] Electron installer olusturuldu
echo.

REM Success
echo [5/5] Tamamlandi!
echo.
echo ========================================
echo        BUILD BASARILI!
echo ========================================
echo.
echo Setup dosyasi:
echo    dist\Yoklama Sistemi Setup 1.0.0.exe
echo.
echo Kurulum icin:
echo    1. "dist" klasorune git
echo    2. "Yoklama Sistemi Setup 1.0.0.exe" dosyasini calistir
echo    3. Kurulum adimlarini takip et
echo    4. Masaustunden "Yoklama Sistemi" ikonuna tikla
echo.
echo Not: Setup.exe dosyasini baskalarına gonderebilirsiniz!
echo.
pause
