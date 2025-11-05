const db = require('../config/database');

class Event {
  static getAll() {
    return db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
  }

  static getActive() {
    return db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY created_at DESC').all();
  }

  static getById(id) {
    return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  }

  static create(data) {
    const { name, description, date, location, allow_multiple_scans, settings } = data;
    const stmt = db.prepare(`
      INSERT INTO events (name, description, date, location, allow_multiple_scans, settings)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name,
      description || null,
      date,
      location || null,
      allow_multiple_scans || 0,
      JSON.stringify(settings || {})
    );
    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const { name, description, date, location, is_active, allow_multiple_scans, settings } = data;
    const stmt = db.prepare(`
      UPDATE events
      SET name = ?, description = ?, date = ?, location = ?,
          is_active = ?, allow_multiple_scans = ?, settings = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      name,
      description || null,
      date,
      location || null,
      is_active !== undefined ? is_active : 1,
      allow_multiple_scans || 0,
      JSON.stringify(settings || {}),
      id
    );
    return this.getById(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM events WHERE id = ?').run(id);
  }

  static getStats(eventId) {
    const total = db.prepare('SELECT COUNT(*) as count FROM participants WHERE event_id = ?').get(eventId);
    const attended = db.prepare(`
      SELECT COUNT(DISTINCT participant_id) as count
      FROM attendance
      WHERE participant_id IN (SELECT id FROM participants WHERE event_id = ?)
    `).get(eventId);

    return {
      total: total.count,
      attended: attended.count,
      remaining: total.count - attended.count
    };
  }
}

module.exports = Event;
