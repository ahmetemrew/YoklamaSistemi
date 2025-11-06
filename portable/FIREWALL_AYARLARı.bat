@echo off
TITLE Firewall Ayarlari - Yoklama Sistemi
echo.
echo ========================================
echo   FIREWALL AYARLARI
echo ========================================
echo.
echo Bu script Windows Firewall'da Port 3000'i acarak
echo telefonlarin baglanmasina izin verir.
echo.
echo ONEMLI: Bu script'i YONETICI olarak calistirmalisiniz!
echo (Sag tik - Yonetici olarak calistir)
echo.
pause

echo.
echo [1/2] Gelen baglantilara izin veriliyor...
netsh advfirewall firewall add rule name="Yoklama Sistemi - Gelen" dir=in action=allow protocol=TCP localport=3000

echo.
echo [2/2] Giden baglantilara izin veriliyor...
netsh advfirewall firewall add rule name="Yoklama Sistemi - Giden" dir=out action=allow protocol=TCP localport=3000

echo.
echo ========================================
echo   BASARILI!
echo ========================================
echo.
echo Port 3000 artik Windows Firewall'da acik.
echo Telefonlardan baglanmayi deneyebilirsiniz.
echo.
echo Adres: http://IP_ADRESINIZ:3000/test
echo.
pause
