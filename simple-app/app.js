// API Base URL
const API_URL = 'http://localhost:3000/api';
let socket = null;
let currentEvent = null;

// Screen Navigation
function showHomeScreen() {
    hideAllScreens();
    document.getElementById('homeScreen').style.display = 'block';
}

function showEventsScreen() {
    hideAllScreens();
    document.getElementById('eventsScreen').style.display = 'block';
    loadEvents();
}

function showCreateEventScreen() {
    hideAllScreens();
    document.getElementById('createEventScreen').style.display = 'block';
}

function showScanningOptions() {
    loadEvents(true); // Load events for scanning
}

function hideAllScreens() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('eventsScreen').style.display = 'none';
    document.getElementById('createEventScreen').style.display = 'none';
    document.getElementById('scanningScreen').style.display = 'none';
}

// Radio button toggle
document.addEventListener('DOMContentLoaded', () => {
    const methodManual = document.getElementById('methodManual');
    const methodExcel = document.getElementById('methodExcel');
    const manualGroup = document.getElementById('manualInputGroup');
    const excelGroup = document.getElementById('excelInputGroup');

    methodManual.addEventListener('change', () => {
        if (methodManual.checked) {
            manualGroup.style.display = 'block';
            excelGroup.style.display = 'none';
        }
    });

    methodExcel.addEventListener('change', () => {
        if (methodExcel.checked) {
            manualGroup.style.display = 'none';
            excelGroup.style.display = 'block';
        }
    });

    // File upload preview
    document.getElementById('excelFile').addEventListener('change', handleFileUpload);

    // Set default date to today
    document.getElementById('eventDate').valueAsDate = new Date();
});

// Load Events
async function loadEvents(forScanning = false) {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();

        if (forScanning) {
            showScanningSelectScreen(events);
        } else {
            displayEventsList(events);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Etkinlikler yüklenirken hata oluştu!');
    }
}

function displayEventsList(events) {
    const eventsList = document.getElementById('eventsList');

    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <h3>Henüz etkinlik yok</h3>
                <p>Yeni bir etkinlik oluşturarak başlayın</p>
            </div>
        `;
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="event-card">
            <h3>${event.name}</h3>
            <div class="event-meta">
                📅 ${new Date(event.date).toLocaleDateString('tr-TR')}
                ${event.location ? `• 📍 ${event.location}` : ''}
            </div>
            <div class="event-actions">
                <button class="btn" onclick="editEvent(${event.id})">
                    ✏️ Düzenle
                </button>
                <button class="btn btn-success" onclick="startScanning(${event.id})">
                    ▶️ Başlat
                </button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id}, '${event.name}')">
                    🗑️ Sil
                </button>
            </div>
        </div>
    `).join('');
}

function showScanningSelectScreen(events) {
    const activeEvents = events.filter(e => e.is_active);

    if (activeEvents.length === 0) {
        alert('Aktif etkinlik bulunamadı! Önce bir etkinlik oluşturun.');
        showEventsScreen();
        return;
    }

    if (activeEvents.length === 1) {
        startScanning(activeEvents[0].id);
        return;
    }

    // Multiple events - show selection
    const eventsList = document.getElementById('eventsScreen');
    hideAllScreens();
    eventsList.style.display = 'block';

    document.querySelector('#eventsScreen .screen-header h2').textContent = 'Yoklama Alınacak Etkinliği Seçin';
    displayEventsList(activeEvents);
}

// Handle File Upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('fileLabel').textContent = file.name;

    try {
        const participants = await parseExcelFile(file);
        displayParticipantsPreview(participants);
    } catch (error) {
        console.error('Error parsing file:', error);
        alert('Dosya okuma hatası! Lütfen geçerli bir Excel/CSV dosyası seçin.');
    }
}

function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet);

                const participants = rows.map(row => {
                    return {
                        name: row.name || row.Name || row.ad || row.Ad || row['İsim'] || row['AD SOYAD'] || '',
                        email: row.email || row.Email || row.eposta || null,
                        phone: row.phone || row.Phone || row.telefon || null
                    };
                }).filter(p => p.name.trim() !== '');

                resolve(participants);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function displayParticipantsPreview(participants) {
    const preview = document.getElementById('participantsPreview');
    const count = document.getElementById('participantCount');
    const list = document.getElementById('participantsList');

    count.textContent = participants.length;
    list.innerHTML = participants.slice(0, 50).map(p => `
        <div class="participant-item">
            <span>${p.name}</span>
            <span style="color: #7f8c8d; font-size: 14px;">${p.email || ''}</span>
        </div>
    `).join('');

    if (participants.length > 50) {
        list.innerHTML += `<div style="text-align: center; color: #7f8c8d; padding: 10px;">
            ... ve ${participants.length - 50} kişi daha
        </div>`;
    }

    preview.style.display = 'block';

    // Store participants globally
    window.currentParticipants = participants;
}

// Create Event
async function createEvent(event) {
    event.preventDefault();

    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const method = document.querySelector('input[name="addMethod"]:checked').value;

    let participants = [];

    if (method === 'manual') {
        const names = document.getElementById('manualNames').value
            .split('\n')
            .map(n => n.trim())
            .filter(n => n !== '');

        participants = names.map(name => ({ name, email: null, phone: null }));
    } else {
        participants = window.currentParticipants || [];
    }

    if (participants.length === 0) {
        alert('Lütfen en az bir katılımcı ekleyin!');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Oluşturuluyor...';

    try {
        // 1. Create Event
        const eventResponse = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, is_active: 1 })
        });

        const eventData = await eventResponse.json();

        // 2. Add Participants
        submitBtn.textContent = '⏳ Katılımcılar ekleniyor...';

        const participantsData = participants.map(p => ({
            event_id: eventData.id,
            name: p.name,
            email: p.email,
            phone: p.phone
        }));

        for (const p of participantsData) {
            await fetch(`${API_URL}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });
        }

        // 3. Generate QR Codes
        submitBtn.textContent = '⏳ QR kodları oluşturuluyor...';

        const qrResponse = await fetch(`${API_URL}/events/${eventData.id}/qrcodes`);
        const qrBlob = await qrResponse.blob();

        // 4. Download QR Codes
        const url = window.URL.createObjectURL(qrBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}_QR_Kodlari.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Success
        alert(`✅ Etkinlik başarıyla oluşturuldu!\n\n${participants.length} kişi için QR kodları indirildi.`);

        // Reset form
        document.getElementById('createEventForm').reset();
        document.getElementById('participantsPreview').style.display = 'none';
        window.currentParticipants = null;

        // Go back to events list
        showEventsScreen();

    } catch (error) {
        console.error('Error creating event:', error);
        alert('Etkinlik oluşturulurken hata oluştu!');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Delete Event
async function deleteEvent(id, name) {
    if (!confirm(`"${name}" etkinliğini silmek istediğinize emin misiniz?\n\nTüm katılımcılar ve yoklama kayıtları silinecektir!`)) {
        return;
    }

    try {
        await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
        alert('Etkinlik silindi!');
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Silme işlemi başarısız!');
    }
}

// Edit Event (Placeholder)
function editEvent(id) {
    alert('Düzenleme özelliği yakında eklenecek!');
}

// Start Scanning
async function startScanning(eventId) {
    try {
        // Load event details
        const eventResponse = await fetch(`${API_URL}/events/${eventId}`);
        const event = await eventResponse.json();

        // Load participants
        const participantsResponse = await fetch(`${API_URL}/events/${eventId}/participants`);
        const participants = await participantsResponse.json();

        currentEvent = { ...event, participants };

        // Show scanning screen
        displayScanningScreen(event, participants);

        // Connect WebSocket
        connectWebSocket();

    } catch (error) {
        console.error('Error starting scan:', error);
        alert('Tarama başlatılırken hata oluştu!');
    }
}

function displayScanningScreen(event, participants) {
    hideAllScreens();

    const scanningScreen = document.getElementById('scanningScreen');
    scanningScreen.style.display = 'block';

    // Get local IP (will be shown by backend)
    const serverUrl = window.location.origin.replace('localhost', getLocalIP());
    const scannerUrl = `${serverUrl}/scanner`;

    scanningScreen.innerHTML = `
        <div class="screen-header">
            <h2>${event.name} - Canlı Tarama</h2>
            <button class="btn btn-danger" onclick="stopScanning()">
                ⏹ Durdur ve Kaydet
            </button>
        </div>

        <div class="scan-info-box">
            <h2>📱 Telefonlardan Bağlanın</h2>
            <div class="connection-url">${scannerUrl}</div>
            <div class="qr-display" id="qrCodeDisplay"></div>
            <p style="margin-top: 15px; opacity: 0.9;">
                Telefon kamerasıyla QR kodu taratın veya yukarıdaki adresi tarayıcıda açın
            </p>
        </div>

        <div class="stats-bar">
            <div class="stat-box">
                <div class="value" id="totalCount">${participants.length}</div>
                <div class="label">Toplam Katılımcı</div>
            </div>
            <div class="stat-box">
                <div class="value" id="scannedCount">0</div>
                <div class="label">Geldi</div>
            </div>
            <div class="stat-box">
                <div class="value" id="remainingCount">${participants.length}</div>
                <div class="label">Gelmedi</div>
            </div>
            <div class="stat-box">
                <div class="value" id="percentageCount">0%</div>
                <div class="label">Katılım Oranı</div>
            </div>
        </div>

        <div class="live-feed">
            <h3>🔴 Canlı Taramalar</h3>
            <div id="liveFeedContent">
                <div style="text-align: center; color: #7f8c8d; padding: 40px;">
                    Tarama bekleniyor...
                </div>
            </div>
        </div>
    `;

    // Generate QR Code for scanner URL
    QRCode.toCanvas(scannerUrl, { width: 256, margin: 2 }, (error, canvas) => {
        if (!error) {
            document.getElementById('qrCodeDisplay').appendChild(canvas);
        }
    });
}

// WebSocket Connection
function connectWebSocket() {
    socket = io(window.location.origin);

    socket.on('connect', () => {
        console.log('WebSocket connected');
    });

    socket.on('attendance:new', (data) => {
        handleNewScan(data);
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });
}

function handleNewScan(data) {
    const liveFeed = document.getElementById('liveFeedContent');
    const scannedCount = document.getElementById('scannedCount');
    const remainingCount = document.getElementById('remainingCount');
    const percentageCount = document.getElementById('percentageCount');

    // Remove "waiting" message
    if (liveFeed.querySelector('[style*="text-align: center"]')) {
        liveFeed.innerHTML = '';
    }

    // Determine status
    let statusClass = 'success';
    let statusText = 'Başarılı';
    let borderClass = '';

    if (data.warning) {
        statusClass = 'warning';
        statusText = '2. Giriş';
        borderClass = 'duplicate';
    } else if (!data.success) {
        statusClass = 'error';
        statusText = 'Geçersiz';
        borderClass = 'invalid';
    }

    // Add scan entry
    const scanEntry = document.createElement('div');
    scanEntry.className = `scan-entry ${borderClass}`;
    scanEntry.innerHTML = `
        <div class="name">
            ${data.participant?.name || 'Bilinmeyen'}
            <span class="status ${statusClass}">${statusText}</span>
        </div>
        <div class="time">${new Date().toLocaleTimeString('tr-TR')}</div>
    `;

    liveFeed.insertBefore(scanEntry, liveFeed.firstChild);

    // Update stats (if success)
    if (data.success && data.stats) {
        scannedCount.textContent = data.stats.attended;
        remainingCount.textContent = data.stats.remaining;
        const percentage = Math.round((data.stats.attended / data.stats.total) * 100);
        percentageCount.textContent = percentage + '%';
    }

    // Keep only last 20 entries
    while (liveFeed.children.length > 20) {
        liveFeed.removeChild(liveFeed.lastChild);
    }
}

// Stop Scanning
async function stopScanning() {
    if (!confirm('Taramayı durdurmak ve verileri kaydetmek istiyor musunuz?')) {
        return;
    }

    // Disconnect WebSocket
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    try {
        // Get final attendance data
        const response = await fetch(`${API_URL}/events/${currentEvent.id}/attendance`);
        const attendance = await response.json();

        // Show statistics
        showStatistics(currentEvent, attendance);

    } catch (error) {
        console.error('Error stopping scan:', error);
        alert('Veriler kaydedilirken hata oluştu!');
    }
}

function showStatistics(event, attendance) {
    const totalParticipants = event.participants.length;
    const attended = new Set(attendance.map(a => a.participant_id)).size;
    const notAttended = totalParticipants - attended;
    const percentage = Math.round((attended / totalParticipants) * 100);

    const stats = `
        📊 YOKLAMA İSTATİSTİKLERİ
        =====================================

        Etkinlik: ${event.name}
        Tarih: ${new Date(event.date).toLocaleDateString('tr-TR')}

        Toplam Katılımcı: ${totalParticipants}
        Geldi: ${attended}
        Gelmedi: ${notAttended}
        Katılım Oranı: ${percentage}%

        Veriler kaydedildi: ${new Date().toLocaleString('tr-TR')}
    `;

    alert(stats);

    // Export to CSV
    exportAttendanceCSV(event, attendance);

    // Return to home
    showHomeScreen();
}

function exportAttendanceCSV(event, attendance) {
    const attendedIds = new Set(attendance.map(a => a.participant_id));

    const csvData = event.participants.map(p => {
        const attended = attendedIds.has(p.id);
        const record = attendance.find(a => a.participant_id === p.id);
        return {
            'Ad Soyad': p.name,
            'Email': p.email || '',
            'Telefon': p.phone || '',
            'Durum': attended ? 'Geldi' : 'Gelmedi',
            'Tarih': record ? new Date(record.scanned_at).toLocaleString('tr-TR') : ''
        };
    });

    // Create CSV
    const headers = Object.keys(csvData[0]);
    const csv = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name}_Yoklama_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Helper: Get Local IP (placeholder)
function getLocalIP() {
    // This will be replaced by server-provided IP
    return 'localhost';
}
