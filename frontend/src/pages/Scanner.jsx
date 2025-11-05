import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { attendanceAPI, eventAPI } from '../utils/api';
import { socket, connectSocket } from '../utils/socket';
import './Scanner.css';

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [registered, setRegistered] = useState(false);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ scans: 0, lastScan: null });
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    loadEvents();
    connectSocket();

    // Generate device ID
    const storedId = localStorage.getItem('scanner_device_id');
    if (storedId) {
      setDeviceId(storedId);
    } else {
      const newId = 'scanner_' + Math.random().toString(36).substring(7);
      localStorage.setItem('scanner_device_id', newId);
      setDeviceId(newId);
    }

    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (deviceId && socket) {
      // Heartbeat - cihazın online olduğunu bildirmek için
      const interval = setInterval(() => {
        socket.emit('device:heartbeat', deviceId);
      }, 30000); // 30 saniyede bir

      return () => clearInterval(interval);
    }
  }, [deviceId]);

  const loadEvents = async () => {
    try {
      const res = await eventAPI.getActive();
      setEvents(res.data);
    } catch (error) {
      console.error('Events load error:', error);
    }
  };

  const registerDevice = () => {
    if (!deviceName.trim()) {
      alert('Lütfen cihaz adı girin');
      return;
    }

    socket.emit('device:register', {
      id: deviceId,
      name: deviceName,
      type: 'scanner'
    });

    setRegistered(true);
    localStorage.setItem('scanner_device_name', deviceName);
  };

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
      );

      setScanning(true);
    } catch (error) {
      alert('Kamera başlatılamadı: ' + error);
      console.error('Camera error:', error);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error('Stop scanning error:', error);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    // Aynı QR kodu tekrar tekrar okumayı engellemek için kısa bir bekleme
    if (result && result.qr === decodedText && Date.now() - result.timestamp < 3000) {
      return;
    }

    try {
      const response = await attendanceAPI.scan({
        qr_code: decodedText,
        device_id: deviceId,
        device_name: deviceName
      });

      if (response.data.success) {
        setResult({
          type: 'success',
          message: response.data.message,
          participant: response.data.participant,
          qr: decodedText,
          timestamp: Date.now()
        });
        setStats(prev => ({ scans: prev.scans + 1, lastScan: new Date() }));

        // 3 saniye sonra sonucu temizle
        setTimeout(() => setResult(null), 3000);
      } else if (response.data.warning) {
        setResult({
          type: 'warning',
          message: response.data.message,
          participant: response.data.participant,
          qr: decodedText,
          timestamp: Date.now()
        });

        setTimeout(() => setResult(null), 4000);
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.message || 'QR kod geçersiz',
        qr: decodedText,
        timestamp: Date.now()
      });

      setTimeout(() => setResult(null), 3000);
    }
  };

  const onScanError = (error) => {
    // Tarama hataları normal, görmezden gel
  };

  if (!registered) {
    return (
      <div className="scanner-container">
        <div className="registration-card">
          <h1>📱 QR Scanner</h1>
          <p>Taramaya başlamak için cihaza bir isim verin</p>
          <input
            type="text"
            placeholder="Örn: Giriş Kapısı, Telefon 1, vb."
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && registerDevice()}
            autoFocus
          />
          <button className="primary" onClick={registerDevice}>
            Başla
          </button>

          {events.length > 0 && (
            <div className="active-events">
              <h3>Aktif Etkinlikler:</h3>
              <ul>
                {events.map(e => (
                  <li key={e.id}>{e.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h2>📷 {deviceName}</h2>
        <div className="scanner-stats">
          <span>Tarama: {stats.scans}</span>
          {stats.lastScan && (
            <span className="last-scan">
              Son: {stats.lastScan.toLocaleTimeString('tr-TR')}
            </span>
          )}
        </div>
      </div>

      <div className="scanner-main">
        <div className="qr-reader-wrapper">
          <div id="qr-reader"></div>
          {!scanning && (
            <div className="start-overlay">
              <button className="scan-button" onClick={startScanning}>
                🎥 Taramaya Başla
              </button>
            </div>
          )}
        </div>

        {scanning && (
          <button className="stop-button" onClick={stopScanning}>
            ⏹ Durdur
          </button>
        )}

        {result && (
          <div className={`result-card ${result.type}`}>
            <div className="result-icon">
              {result.type === 'success' && '✓'}
              {result.type === 'warning' && '⚠'}
              {result.type === 'error' && '✗'}
            </div>
            <div className="result-content">
              <h3>{result.message}</h3>
              {result.participant && (
                <div className="participant-info">
                  <p className="name">{result.participant.name}</p>
                  {result.participant.email && (
                    <p className="email">{result.participant.email}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div className="active-events-footer">
            <strong>Aktif Etkinlik:</strong> {events.map(e => e.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export default Scanner;
