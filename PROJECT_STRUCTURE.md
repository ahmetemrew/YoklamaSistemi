# 📁 Project Structure

```
YoklamaSistemi/
│
├── 📦 backend/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # SQLite connection
│   │   │   └── initDatabase.js      # Schema initialization
│   │   │
│   │   ├── models/
│   │   │   ├── Event.js             # Event model
│   │   │   ├── Participant.js       # Participant model
│   │   │   ├── Attendance.js        # Attendance model
│   │   │   └── Device.js            # Device model
│   │   │
│   │   ├── controllers/
│   │   │   ├── eventController.js
│   │   │   ├── participantController.js
│   │   │   ├── attendanceController.js
│   │   │   └── deviceController.js
│   │   │
│   │   ├── routes/
│   │   │   └── index.js             # API routes
│   │   │
│   │   └── server.js                # Main server file
│   │
│   └── package.json
│
├── 🎨 frontend/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin.jsx            # Admin panel
│   │   │   ├── Admin.css
│   │   │   ├── Scanner.jsx          # QR scanner (mobile)
│   │   │   └── Scanner.css
│   │   │
│   │   ├── components/
│   │   │   └── admin/
│   │   │       ├── EventList.jsx    # Event list component
│   │   │       ├── EventList.css
│   │   │       ├── EventDetail.jsx  # Event detail component
│   │   │       └── EventDetail.css
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js               # API client
│   │   │   └── socket.js            # WebSocket client
│   │   │
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── 🖥️ electron/                     # Electron wrapper (.exe)
│   ├── main.js                      # Electron main process
│   └── preload.js                   # Preload script
│
├── 📊 database/                     # SQLite database (auto-created)
│   └── yoklama.db                   # Main database file
│
├── 📄 docs/                         # Documentation
│   ├── API.md                       # API documentation
│   └── EXCEL_FORMAT.md              # Excel import format guide
│
├── 📋 Root Files
│   ├── package.json                 # Root package (Electron)
│   ├── README.md                    # Main documentation
│   ├── QUICKSTART.md                # Quick start guide
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── .gitignore
│   └── .env.example                 # Environment variables example
│
└── 🚀 Generated (after build)
    ├── qrcodes/                     # Generated QR codes (temp)
    ├── release/                     # Electron builds
    │   └── YoklamaSistemi-Setup.exe
    └── frontend/dist/               # Frontend build output
```

## 📊 File Statistics

- **Total Files:** 36+ source files
- **Backend:** 10+ JS files
- **Frontend:** 12+ JSX/CSS files
- **Documentation:** 5 MD files
- **Configuration:** 5 JSON files

## 🗂️ Key Directories

### `/backend`
Backend server içerir. Tüm API endpoints, database logic ve WebSocket burada.

**Önemli dosyalar:**
- `server.js` - Ana server
- `config/database.js` - Database connection
- `routes/index.js` - Tüm API routes
- `models/*.js` - Database models

### `/frontend`
React tabanlı frontend. Admin panel ve QR scanner sayfası.

**Önemli dosyalar:**
- `App.jsx` - Ana routing
- `pages/Admin.jsx` - Admin dashboard
- `pages/Scanner.jsx` - QR tarayıcı (mobil)
- `utils/api.js` - Backend API client

### `/electron`
Electron wrapper. Windows .exe oluşturmak için.

**Önemli dosyalar:**
- `main.js` - Electron ana process
- Backend'i başlatır ve browser window açar

### `/database`
SQLite database dosyaları. Otomatik oluşturulur.

**Dosyalar:**
- `yoklama.db` - Ana database
- `yoklama.db-shm` - Shared memory (WAL mode)
- `yoklama.db-wal` - Write-ahead log

### `/docs`
Ek dökümanlar ve kılavuzlar.

## 🏗️ Build Output

### Frontend Build
```bash
npm run build
# Output: frontend/dist/
```

### Electron Build
```bash
npm run electron:build
# Output: release/YoklamaSistemi-Setup.exe
```

## 🔄 Development Workflow

```
Developer
   │
   ├─► Edit Backend Code (backend/src/)
   │   └─► nodemon auto-restart
   │
   ├─► Edit Frontend Code (frontend/src/)
   │   └─► Vite HMR (Hot Module Reload)
   │
   └─► Test
       ├─► Admin Panel: http://localhost:3000
       └─► Scanner: http://localhost:3000/scanner
```

## 📦 Dependencies

### Backend
- express (Web framework)
- better-sqlite3 (Database)
- socket.io (Real-time)
- qrcode (QR generation)
- xlsx (Excel parsing)
- archiver (ZIP creation)

### Frontend
- react (UI framework)
- react-router-dom (Routing)
- html5-qrcode (QR scanning)
- socket.io-client (WebSocket)
- axios (HTTP client)

### Electron
- electron (Desktop wrapper)
- electron-builder (Build tool)

## 🎯 Entry Points

| Environment | Entry Point | URL |
|-------------|-------------|-----|
| Development (Backend) | `backend/src/server.js` | http://localhost:3000 |
| Development (Frontend) | `frontend/src/main.jsx` | http://localhost:5173 |
| Production | `backend/src/server.js` | http://localhost:3000 |
| Electron | `electron/main.js` | (Opens window) |

## 🔐 Important Files

### Configuration
- `backend/package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies
- `frontend/vite.config.js` - Vite build config
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variables template

### Documentation
- `README.md` - Main documentation
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT.md` - Production deployment
- `docs/API.md` - API reference
- `docs/EXCEL_FORMAT.md` - Excel format guide

## 🚫 Ignored Files (.gitignore)

- `node_modules/` - Dependencies
- `dist/` - Build output
- `release/` - Electron builds
- `*.db` - Database files
- `qrcodes/` - Generated QR codes
- `.env` - Environment variables

## 📊 Code Organization

### Backend (MVC Pattern)
```
Model → Controller → Route → Server
  ↓         ↓         ↓        ↓
Database  Business  Endpoints Express
          Logic
```

### Frontend (Component-Based)
```
App → Router → Pages → Components
 ↓       ↓       ↓        ↓
Root   Routes  Views   Reusable
```

## 🔄 Data Flow

```
Scanner (Phone)
   ↓ QR Code
   ↓ POST /api/attendance/scan
Backend API
   ↓ Validate & Save
Database
   ↓ Socket.io Emit
Admin Panel (PC)
   ↓ Real-time Update
Dashboard Updated
```

## 🎨 Styling

- CSS Modules per component
- No CSS framework (vanilla CSS)
- Responsive design (mobile-first)
- Custom color palette

## 🧪 Testing Structure (Future)

```
tests/
├── backend/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── frontend/
    ├── unit/
    └── e2e/
```

## 📝 Notes

- Single-page application (SPA)
- RESTful API
- Real-time updates via WebSocket
- SQLite for simplicity
- No authentication (can be added)
- Responsive design
- PWA-ready (scanner page)
