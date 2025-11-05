import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../../utils/api';
import './EventList.css';

function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    allow_multiple_scans: false
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventAPI.getAll();
      setEvents(res.data);
    } catch (error) {
      alert('Etkinlikler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.create(formData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        allow_multiple_scans: false
      });
      loadEvents();
    } catch (error) {
      alert('Etkinlik oluşturulamadı: ' + error.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" etkinliğini silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await eventAPI.delete(id);
      loadEvents();
    } catch (error) {
      alert('Silme işlemi başarısız: ' + error.message);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="event-list-container">
      <div className="header">
        <h2>Etkinlikler</h2>
        <button className="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ İptal' : '➕ Yeni Etkinlik'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>Yeni Etkinlik Oluştur</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Etkinlik Adı *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Konferans 2024"
              />
            </div>

            <div className="form-group">
              <label>Açıklama</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Etkinlik hakkında kısa bilgi"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tarih *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Lokasyon</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Örn: Merkez Ofis"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.allow_multiple_scans}
                  onChange={(e) => setFormData({ ...formData, allow_multiple_scans: e.target.checked })}
                />
                {' '}Birden fazla giriş çıkış kaydı izin ver
              </label>
            </div>

            <button type="submit" className="success">Oluştur</button>
          </form>
        </div>
      )}

      <div className="events-grid">
        {events.length === 0 ? (
          <div className="card">
            <p className="text-center">Henüz etkinlik yok. Yukarıdan yeni etkinlik oluşturun.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card card">
              <div className="event-header">
                <h3>{event.name}</h3>
                <span className={`status-badge ${event.is_active ? 'active' : 'inactive'}`}>
                  {event.is_active ? '✓ Aktif' : '✕ Pasif'}
                </span>
              </div>

              {event.description && (
                <p className="event-description">{event.description}</p>
              )}

              <div className="event-meta">
                <div className="meta-item">
                  📅 {new Date(event.date).toLocaleDateString('tr-TR')}
                </div>
                {event.location && (
                  <div className="meta-item">
                    📍 {event.location}
                  </div>
                )}
              </div>

              <div className="event-actions">
                <button
                  className="primary"
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                >
                  Detay
                </button>
                <button
                  className="danger"
                  onClick={() => handleDelete(event.id, event.name)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventList;
