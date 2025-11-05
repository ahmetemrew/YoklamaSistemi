# 🔌 API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

Şu anda authentication yok. Production için eklenebilir.

---

## Events (Etkinlikler)

### Get All Events
```http
GET /api/events
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Konferans 2024",
    "description": "Yıllık konferans",
    "date": "2024-06-15",
    "location": "Merkez Ofis",
    "is_active": 1,
    "allow_multiple_scans": 0,
    "settings": "{}",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

### Get Active Events
```http
GET /api/events/active
```

Sadece `is_active = 1` olanlar döner.

### Get Event by ID
```http
GET /api/events/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Konferans 2024",
  "stats": {
    "total": 300,
    "attended": 245,
    "remaining": 55
  }
}
```

### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "name": "Yeni Etkinlik",
  "description": "Açıklama",
  "date": "2024-06-15",
  "location": "İstanbul",
  "allow_multiple_scans": false
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Yeni Etkinlik",
  "is_active": 1,
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

### Update Event
```http
PUT /api/events/:id
Content-Type: application/json

{
  "name": "Güncellenmiş İsim",
  "is_active": 0
}
```

### Delete Event
```http
DELETE /api/events/:id
```

**Response:**
```json
{
  "message": "Etkinlik silindi"
}
```

### Get Event Stats
```http
GET /api/events/:id/stats
```

**Response:**
```json
{
  "total": 300,
  "attended": 245,
  "remaining": 55
}
```

---

## Participants (Katılımcılar)

### Get Participants by Event
```http
GET /api/events/:eventId/participants
```

**Response:**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "name": "Ali Yılmaz",
    "email": "ali@example.com",
    "phone": "05551234567",
    "qr_code_data": "uuid-1234-5678",
    "scan_count": 1,
    "last_scan": "2024-01-15T09:30:00.000Z"
  }
]
```

### Get Participant by ID
```http
GET /api/participants/:id
```

### Create Participant
```http
POST /api/participants
Content-Type: application/json

{
  "event_id": 1,
  "name": "Ali Yılmaz",
  "email": "ali@example.com",
  "phone": "05551234567"
}
```

**Response:**
```json
{
  "id": 1,
  "event_id": 1,
  "name": "Ali Yılmaz",
  "qr_code_data": "auto-generated-uuid",
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

### Import Participants (Excel)
```http
POST /api/participants/import
Content-Type: multipart/form-data

file: [Excel File]
eventId: 1
```

**Response:**
```json
{
  "message": "250 katılımcı eklendi, 5 hata",
  "results": [
    { "success": true, "id": 1, "name": "Ali Yılmaz" },
    { "success": false, "name": "Ayşe Demir", "error": "Bu katılımcı zaten kayıtlı" }
  ]
}
```

### Update Participant
```http
PUT /api/participants/:id
Content-Type: application/json

{
  "name": "Ali Yılmaz (Güncel)",
  "email": "yeni@example.com"
}
```

### Delete Participant
```http
DELETE /api/participants/:id
```

### Download QR Codes (ZIP)
```http
GET /api/events/:eventId/qrcodes
```

**Response:** ZIP file download başlar

---

## Attendance (Yoklama)

### Scan QR Code
```http
POST /api/attendance/scan
Content-Type: application/json

{
  "qr_code": "uuid-1234-5678",
  "device_id": "scanner_abc123",
  "device_name": "Giriş Kapısı",
  "location": "Ana Giriş"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Ali Yılmaz yoklamaya kaydedildi",
  "participant": {
    "id": 1,
    "name": "Ali Yılmaz",
    "email": "ali@example.com"
  },
  "attendance": {
    "id": 1,
    "participant_id": 1,
    "device_id": "scanner_abc123",
    "scanned_at": "2024-01-15T09:30:00.000Z"
  },
  "stats": {
    "total": 300,
    "attended": 245,
    "remaining": 55
  }
}
```

**Warning Response (Daha önce tarandı):**
```json
{
  "success": false,
  "warning": true,
  "message": "Bu kişi daha önce yoklama verdi",
  "participant": {
    "name": "Ali Yılmaz",
    "email": "ali@example.com"
  },
  "previous_scans": [
    {
      "id": 1,
      "scanned_at": "2024-01-15T08:00:00.000Z",
      "device_name": "Giriş Kapısı"
    }
  ]
}
```

**Error Response (Geçersiz QR):**
```json
{
  "success": false,
  "error": "Geçersiz QR kod",
  "message": "Bu QR kod sisteme kayıtlı değil"
}
```

### Get Attendance by Event
```http
GET /api/events/:eventId/attendance
```

**Response:**
```json
[
  {
    "id": 1,
    "participant_id": 1,
    "name": "Ali Yılmaz",
    "email": "ali@example.com",
    "device_id": "scanner_abc123",
    "device_name": "Giriş Kapısı",
    "scanned_at": "2024-01-15T09:30:00.000Z"
  }
]
```

### Get Recent Scans
```http
GET /api/attendance/recent?limit=50
```

Son N taramayı döner (default: 50).

### Delete Attendance
```http
DELETE /api/attendance/:id
```

---

## Devices (Cihazlar)

### Get All Devices
```http
GET /api/devices
```

**Response:**
```json
[
  {
    "id": "scanner_abc123",
    "name": "Giriş Kapısı",
    "type": "scanner",
    "is_online": 1,
    "last_active": "2024-01-15T09:30:00.000Z"
  }
]
```

### Get Online Devices
```http
GET /api/devices/online
```

Sadece `is_online = 1` olanlar.

### Register Device
```http
POST /api/devices/register
Content-Type: application/json

{
  "id": "scanner_abc123",
  "name": "Giriş Kapısı",
  "type": "scanner"
}
```

### Update Device Activity
```http
PUT /api/devices/:id/activity
```

Son aktivite zamanını günceller.

### Delete Device
```http
DELETE /api/devices/:id
```

---

## WebSocket Events

### Client → Server

#### Register Device
```javascript
socket.emit('device:register', {
  id: 'scanner_abc123',
  name: 'Giriş Kapısı',
  type: 'scanner'
});
```

#### Heartbeat
```javascript
socket.emit('device:heartbeat', 'scanner_abc123');
```

### Server → Client

#### New Attendance
```javascript
socket.on('attendance:new', (data) => {
  console.log(data);
  // {
  //   attendance: {...},
  //   participant: {...},
  //   event: {...}
  // }
});
```

#### Device Registered
```javascript
socket.on('device:registered', (device) => {
  console.log(device);
});
```

#### Device List Updated
```javascript
socket.on('device:list', (devices) => {
  console.log(devices); // Online devices array
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Geçersiz istek"
}
```

### 404 Not Found
```json
{
  "error": "Kayıt bulunamadı"
}
```

### 500 Internal Server Error
```json
{
  "error": "Sunucu hatası"
}
```

---

## Rate Limiting

Şu anda yok. Production için eklenebilir:
- 100 request / 15 dakika / IP

---

## CORS

Development: `*` (tüm originler)
Production: Belirli domainler

---

## Example Usage

### JavaScript (Fetch API)
```javascript
// Create event
fetch('http://localhost:3000/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Etkinlik',
    date: '2024-06-15',
    location: 'İstanbul'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Scan QR
fetch('http://localhost:3000/api/attendance/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    qr_code: 'uuid-1234',
    device_id: 'scanner_1',
    device_name: 'Telefon 1'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Başarılı:', data.message);
  } else {
    console.warn('Uyarı:', data.message);
  }
});
```

### cURL
```bash
# Create event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Etkinlik",
    "date": "2024-06-15",
    "location": "İstanbul"
  }'

# Get events
curl http://localhost:3000/api/events

# Scan QR
curl -X POST http://localhost:3000/api/attendance/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "uuid-1234",
    "device_id": "scanner_1",
    "device_name": "Telefon 1"
  }'
```

### Python (requests)
```python
import requests

# Create event
response = requests.post('http://localhost:3000/api/events', json={
    'name': 'Test Etkinlik',
    'date': '2024-06-15',
    'location': 'İstanbul'
})
print(response.json())

# Scan QR
response = requests.post('http://localhost:3000/api/attendance/scan', json={
    'qr_code': 'uuid-1234',
    'device_id': 'scanner_1',
    'device_name': 'Telefon 1'
})
data = response.json()
if data.get('success'):
    print(f"Başarılı: {data['message']}")
```
