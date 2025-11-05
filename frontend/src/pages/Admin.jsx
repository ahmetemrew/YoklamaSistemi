import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { eventAPI, attendanceAPI, deviceAPI } from '../utils/api';
import { socket, connectSocket } from '../utils/socket';
import EventList from '../components/admin/EventList';
import EventDetail from '../components/admin/EventDetail';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ events: 0, devices: 0, recentScans: 0 });
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    loadDashboardData();
    connectSocket();

    // Real-time updates
    socket.on('attendance:new', (data) => {
      loadDashboardData();
    });

    socket.on('device:list', (devices) => {
      setStats(prev => ({ ...prev, devices: devices.length }));
    });

    return () => {
      socket.off('attendance:new');
      socket.off('device:list');
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [eventsRes, devicesRes, scansRes] = await Promise.all([
        eventAPI.getAll(),
        deviceAPI.getOnline(),
        attendanceAPI.getRecent(10)
      ]);

      setStats({
        events: eventsRes.data.length,
        devices: devicesRes.data.length,
        recentScans: scansRes.data.length
      });

      setRecentScans(scansRes.data);
    } catch (error) {
      console.error('Dashboard data load error:', error);
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>📋 Yoklama Sistemi</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item">
            🏠 Dashboard
          </Link>
          <Link to="/admin/events" className="nav-item">
            📅 Etkinlikler
          </Link>
          <Link to="/scanner" className="nav-item" target="_blank">
            📱 Scanner Aç
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="stat-card">
            <div className="stat-label">Aktif Etkinlik</div>
            <div className="stat-value">{stats.events}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Bağlı Cihaz</div>
            <div className="stat-value">{stats.devices}</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard recentScans={recentScans} />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard({ recentScans }) {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="card">
          <h3>Son Yoklamalar</h3>
          {recentScans.length === 0 ? (
            <p>Henüz yoklama kaydı yok</p>
          ) : (
            <div className="recent-scans">
              {recentScans.map((scan) => (
                <div key={scan.id} className="scan-item">
                  <div className="scan-name">{scan.name}</div>
                  <div className="scan-time">
                    {new Date(scan.scanned_at).toLocaleString('tr-TR')}
                  </div>
                  <div className="scan-event">{scan.event_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Hızlı İşlemler</h3>
          <Link to="/admin/events" className="quick-action">
            <button className="primary">➕ Yeni Etkinlik</button>
          </Link>
          <a href="/scanner" target="_blank" className="quick-action">
            <button className="success">📱 Scanner Aç</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Admin;
