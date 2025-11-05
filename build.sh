#!/bin/bash
# Build Script - Yoklama Sistemi
# Windows için Git Bash veya Linux/Mac terminal'de çalıştırın

echo "🚀 Yoklama Sistemi Build Başlıyor..."
echo ""

# 1. Frontend Build
echo "📦 Frontend build ediliyor..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build hatası!"
    exit 1
fi

echo "✅ Frontend build tamamlandı: frontend/dist/"
echo ""

# 2. Backend Hazırlama
echo "🔧 Backend hazırlanıyor..."
cd ../backend
npm install --production=false

if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies hatası!"
    exit 1
fi

echo "✅ Backend hazır"
echo ""

# 3. Database Başlatma
echo "🗄️ Database başlatılıyor..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "⚠️ Database zaten var veya hata oluştu"
fi

echo ""
echo "✅ Build tamamlandı!"
echo ""
echo "📍 Çalıştırmak için:"
echo "   cd backend"
echo "   npm start"
echo ""
