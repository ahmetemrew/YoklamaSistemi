const Attendance = require('../models/Attendance');
const Participant = require('../models/Participant');
const Event = require('../models/Event');

exports.scanQRCode = (req, res) => {
  try {
    const { qr_code, device_id, device_name, location } = req.body;

    if (!qr_code) {
      return res.status(400).json({ error: 'QR kod gerekli' });
    }

    // Katılımcıyı bul
    const participant = Participant.getByQRCode(qr_code);

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Geçersiz QR kod',
        message: 'Bu QR kod sisteme kayıtlı değil'
      });
    }

    // Etkinliği kontrol et
    const event = Event.getById(participant.event_id);

    if (!event || !event.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Etkinlik aktif değil',
        message: 'Bu etkinlik henüz başlamadı veya sona erdi'
      });
    }

    // Daha önce tarandı mı kontrol et
    const alreadyScanned = Attendance.checkIfScanned(participant.id);

    if (alreadyScanned && !event.allow_multiple_scans) {
      const previousScans = Attendance.getByParticipantId(participant.id);
      return res.status(200).json({
        success: false,
        warning: true,
        message: 'Bu kişi daha önce yoklama verdi',
        participant: {
          name: participant.name,
          email: participant.email
        },
        previous_scans: previousScans
      });
    }

    // Yoklama kaydı oluştur
    const attendance = Attendance.create({
      participant_id: participant.id,
      device_id: device_id || 'unknown',
      device_name: device_name || 'Bilinmeyen Cihaz',
      location: location || null
    });

    // Socket.io ile gerçek zamanlı bildirim gönder
    if (req.io) {
      req.io.emit('attendance:new', {
        attendance,
        participant: {
          name: participant.name,
          email: participant.email
        },
        event: {
          name: event.name
        }
      });
    }

    res.json({
      success: true,
      message: `${participant.name} yoklamaya kaydedildi`,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email
      },
      attendance,
      stats: Event.getStats(event.id)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceByEvent = (req, res) => {
  try {
    const attendance = Attendance.getByEventId(req.params.eventId);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentScans = (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const scans = Attendance.getRecentScans(limit);
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAttendance = (req, res) => {
  try {
    Attendance.delete(req.params.id);
    res.json({ message: 'Yoklama kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
