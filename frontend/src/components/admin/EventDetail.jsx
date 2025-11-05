import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, participantAPI, attendanceAPI } from '../../utils/api';
import { socket } from '../../utils/socket';
import './EventDetail.css';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, attended: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('participants');
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    loadEventData();

    // Real-time updates
    socket.on('attendance:new', (data) => {
      if (data.event?.id === parseInt(id)) {
        loadEventData();
      }
    });

    return () => {
      socket.off('attendance:new');
    };
  }, [id]);

  const loadEventData = async () => {
    try {
      const [eventRes, participantsRes, attendanceRes] = await Promise.all([
        eventAPI.getById(id),
        participantAPI.getByEvent(id),
        attendanceAPI.getByEvent(id)
      ]);

      setEvent(eventRes.data);
      setParticipants(participantsRes.data);
      setAttendance(attendanceRes.data);
      setStats(eventRes.data.stats || { total: 0, attended: 0, remaining: 0 });
    } catch (error) {
      alert('Veri yüklenemedi: ' + error.message);
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) {
      alert('Lütfen bir dosya seçin');
      return;
    }

    try {
      await participantAPI.import(id, importFile);
      setImportFile(null);
      loadEventData();
      alert('Katılımcılar başarıyla içe aktarıldı!');
    } catch (error) {
      alert('İçe aktarma hatası: ' + error.message);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await participantAPI.downloadQRCodes(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcodes_${event.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('QR kod indirme hatası: ' + error.message);
    }
  };

  const handleDeleteParticipant = async (participantId, name) => {
    if (!confirm(`${name} katılımcısını silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await participantAPI.delete(participantId);
      loadEventData();
    } catch (error) {
      alert('Silme hatası: ' + error.message);
    }
  };

  const toggleEventStatus = async () => {
    try {
      await eventAPI.update(id, { ...event, is_active: !event.is_active });
      loadEventData();
    } catch (error) {
      alert('Güncelleme hatası: ' + error.message);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="event-detail-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/admin/events')}>
          ← Geri
        </button>
        <h2>{event.name}</h2>
        <button
          className={event.is_active ? 'danger' : 'success'}
          onClick={toggleEventStatus}
        >
          {event.is_active ? 'Pasif Yap' : 'Aktif Yap'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Toplam Katılımcı</div>
        </div>
        <div className="stat-box success">
          <div className="stat-number">{stats.attended}</div>
          <div className="stat-label">Geldi</div>
        </div>
        <div className="stat-box warning">
          <div className="stat-number">{stats.remaining}</div>
          <div className="stat-label">Gelmedi</div>
        </div>
        <div className="stat-box info">
          <div className="stat-number">
            {stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%
          </div>
          <div className="stat-label">Katılım Oranı</div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'participants' ? 'active' : ''}
          onClick={() => setActiveTab('participants')}
        >
          Katılımcılar ({participants.length})
        </button>
        <button
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          Yoklama Kayıtları ({attendance.length})
        </button>
      </div>

      {activeTab === 'participants' && (
        <div className="tab-content">
          <div className="actions-bar">
            <form onSubmit={handleImport} className="import-form">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              <button type="submit" className="primary">
                📤 Excel İçe Aktar
              </button>
            </form>
            <button
              className="success"
              onClick={handleDownloadQR}
              disabled={participants.length === 0}
            >
              📥 QR Kodları İndir
            </button>
          </div>

          {participants.length === 0 ? (
            <div className="card">
              <p className="text-center">
                Henüz katılımcı yok. Excel dosyası ile içe aktarın.
              </p>
            </div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>QR Kod</th>
                    <th>Tarama Sayısı</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className={p.scan_count > 0 ? 'attended' : ''}>
                      <td>{p.name}</td>
                      <td>{p.email || '-'}</td>
                      <td>{p.phone || '-'}</td>
                      <td>
                        <code className="qr-code">{p.qr_code_data.substring(0, 8)}...</code>
                      </td>
                      <td>
                        <span className={`badge ${p.scan_count > 0 ? 'success' : 'default'}`}>
                          {p.scan_count}
                        </span>
                      </td>
                      <td>
                        <button
                          className="danger small"
                          onClick={() => handleDeleteParticipant(p.id, p.name)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="tab-content">
          {attendance.length === 0 ? (
            <div className="card">
              <p className="text-center">Henüz yoklama kaydı yok.</p>
            </div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Katılımcı</th>
                    <th>Email</th>
                    <th>Cihaz</th>
                    <th>Tarih/Saat</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{a.email || '-'}</td>
                      <td>{a.device_name}</td>
                      <td>{new Date(a.scanned_at).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EventDetail;
