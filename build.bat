@echo off
REM Build Script - Yoklama Sistemi (Windows)

echo ========================================
echo    Yoklama Sistemi Build Baslıyor
echo ========================================
echo.

REM 1. Frontend Build
echo [1/3] Frontend build ediliyor...
cd frontend
call npm run build

if errorlevel 1 (
    echo.
    echo [HATA] Frontend build hatası!
    pause
    exit /b 1
)

echo [OK] Frontend build tamamlandi: frontend/dist/
echo.

REM 2. Backend Hazırlama
echo [2/3] Backend hazirlaniyor...
cd ..\backend
call npm install --production=false

if errorlevel 1 (
    echo.
    echo [HATA] Backend dependencies hatası!
    pause
    exit /b 1
)

echo [OK] Backend hazir
echo.

REM 3. Database Başlatma
echo [3/3] Database baslatiliyor...
call npm run init-db

echo.
echo ========================================
echo        Build Tamamlandi!
echo ========================================
echo.
echo Calistirmak icin:
echo    cd backend
echo    npm start
echo.
pause
