const db = require('../config/database');

class Device {
  static getAll() {
    return db.prepare('SELECT * FROM devices ORDER BY last_active DESC').all();
  }

  static getOnline() {
    return db.prepare('SELECT * FROM devices WHERE is_online = 1').all();
  }

  static getById(id) {
    return db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
  }

  static register(data) {
    const { id, name, type, metadata } = data;

    const exists = this.getById(id);
    if (exists) {
      return this.updateActivity(id);
    }

    const stmt = db.prepare(`
      INSERT INTO devices (id, name, type, metadata)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      type || 'scanner',
      JSON.stringify(metadata || {})
    );

    return this.getById(id);
  }

  static updateActivity(id) {
    db.prepare(`
      UPDATE devices
      SET last_active = CURRENT_TIMESTAMP, is_online = 1
      WHERE id = ?
    `).run(id);
    return this.getById(id);
  }

  static setOffline(id) {
    db.prepare('UPDATE devices SET is_online = 0 WHERE id = ?').run(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM devices WHERE id = ?').run(id);
  }
}

module.exports = Device;
