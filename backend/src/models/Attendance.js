const db = require('../config/database');

class Attendance {
  static getAll() {
    return db.prepare(`
      SELECT a.*, p.name, p.email, p.event_id, e.name as event_name
      FROM attendance a
      JOIN participants p ON a.participant_id = p.id
      JOIN events e ON p.event_id = e.id
      ORDER BY a.scanned_at DESC
    `).all();
  }

  static getByEventId(eventId) {
    return db.prepare(`
      SELECT a.*, p.name, p.email
      FROM attendance a
      JOIN participants p ON a.participant_id = p.id
      WHERE p.event_id = ?
      ORDER BY a.scanned_at DESC
    `).all(eventId);
  }

  static getByParticipantId(participantId) {
    return db.prepare(`
      SELECT * FROM attendance
      WHERE participant_id = ?
      ORDER BY scanned_at DESC
    `).all(participantId);
  }

  static create(data) {
    const { participant_id, device_id, device_name, scan_type, location, notes } = data;

    const stmt = db.prepare(`
      INSERT INTO attendance (participant_id, device_id, device_name, scan_type, location, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      participant_id,
      device_id,
      device_name || 'Bilinmeyen Cihaz',
      scan_type || 'entry',
      location || null,
      notes || null
    );

    return db.prepare('SELECT * FROM attendance WHERE id = ?').get(result.lastInsertRowid);
  }

  static checkIfScanned(participantId) {
    const result = db.prepare(`
      SELECT * FROM attendance
      WHERE participant_id = ?
      ORDER BY scanned_at DESC
      LIMIT 1
    `).get(participantId);

    return result ? true : false;
  }

  static getRecentScans(limit = 50) {
    return db.prepare(`
      SELECT a.*, p.name, p.email, p.event_id, e.name as event_name
      FROM attendance a
      JOIN participants p ON a.participant_id = p.id
      JOIN events e ON p.event_id = e.id
      ORDER BY a.scanned_at DESC
      LIMIT ?
    `).all(limit);
  }

  static delete(id) {
    return db.prepare('DELETE FROM attendance WHERE id = ?').run(id);
  }
}

module.exports = Attendance;
