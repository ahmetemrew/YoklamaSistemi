const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Participant {
  static getByEventId(eventId) {
    return db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM attendance WHERE participant_id = p.id) as scan_count,
        (SELECT scanned_at FROM attendance WHERE participant_id = p.id ORDER BY scanned_at DESC LIMIT 1) as last_scan
      FROM participants p
      WHERE p.event_id = ?
      ORDER BY p.name
    `).all(eventId);
  }

  static getById(id) {
    return db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
  }

  static getByQRCode(qrCode) {
    return db.prepare('SELECT * FROM participants WHERE qr_code_data = ?').get(qrCode);
  }

  static create(data) {
    const { event_id, name, email, phone, identifier, metadata } = data;
    const qr_code_data = identifier || uuidv4();

    const stmt = db.prepare(`
      INSERT INTO participants (event_id, name, email, phone, identifier, qr_code_data, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        event_id,
        name,
        email || null,
        phone || null,
        qr_code_data,
        qr_code_data,
        JSON.stringify(metadata || {})
      );
      return this.getById(result.lastInsertRowid);
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        throw new Error('Bu katılımcı zaten kayıtlı');
      }
      throw error;
    }
  }

  static createBulk(participants) {
    const insert = db.prepare(`
      INSERT INTO participants (event_id, name, email, phone, identifier, qr_code_data, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      const results = [];
      for (const p of items) {
        const qr_code_data = p.identifier || uuidv4();
        try {
          const result = insert.run(
            p.event_id,
            p.name,
            p.email || null,
            p.phone || null,
            qr_code_data,
            qr_code_data,
            JSON.stringify(p.metadata || {})
          );
          results.push({ success: true, id: result.lastInsertRowid, name: p.name });
        } catch (error) {
          results.push({ success: false, name: p.name, error: error.message });
        }
      }
      return results;
    });

    return insertMany(participants);
  }

  static update(id, data) {
    const { name, email, phone, metadata } = data;
    const stmt = db.prepare(`
      UPDATE participants
      SET name = ?, email = ?, phone = ?, metadata = ?
      WHERE id = ?
    `);
    stmt.run(
      name,
      email || null,
      phone || null,
      JSON.stringify(metadata || {}),
      id
    );
    return this.getById(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM participants WHERE id = ?').run(id);
  }

  static deleteByEventId(eventId) {
    return db.prepare('DELETE FROM participants WHERE event_id = ?').run(eventId);
  }
}

module.exports = Participant;
