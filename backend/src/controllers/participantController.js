const Participant = require('../models/Participant');
const XLSX = require('xlsx');
const QRCode = require('qrcode');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

exports.getParticipantsByEvent = (req, res) => {
  try {
    const participants = Participant.getByEventId(req.params.eventId);
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getParticipantById = (req, res) => {
  try {
    const participant = Participant.getById(req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Katılımcı bulunamadı' });
    }
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createParticipant = (req, res) => {
  try {
    const participant = Participant.create(req.body);
    res.status(201).json(participant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.importParticipants = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const { eventId } = req.body;

    const participants = data.map(row => ({
      event_id: eventId,
      name: row.name || row.Name || row.ad || row.Ad || row['İsim'],
      email: row.email || row.Email || row.eposta || null,
      phone: row.phone || row.Phone || row.telefon || null,
      identifier: row.identifier || row.id || null,
      metadata: {}
    }));

    const results = Participant.createBulk(participants);

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      message: `${success} katılımcı eklendi, ${failed} hata`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateParticipant = (req, res) => {
  try {
    const participant = Participant.update(req.params.id, req.body);
    if (!participant) {
      return res.status(404).json({ error: 'Katılımcı bulunamadı' });
    }
    res.json(participant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteParticipant = (req, res) => {
  try {
    Participant.delete(req.params.id);
    res.json({ message: 'Katılımcı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateQRCodes = async (req, res) => {
  try {
    const participants = Participant.getByEventId(req.params.eventId);

    if (participants.length === 0) {
      return res.status(404).json({ error: 'Katılımcı bulunamadı' });
    }

    const qrDir = path.join(__dirname, '../../../qrcodes', req.params.eventId);
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // QR kodları oluştur
    for (const p of participants) {
      const qrPath = path.join(qrDir, `${p.id}_${p.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
      await QRCode.toFile(qrPath, p.qr_code_data, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
    }

    // ZIP dosyası oluştur
    const zipPath = path.join(__dirname, '../../../qrcodes', `event_${req.params.eventId}_qrcodes.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(zipPath, `qrcodes_${req.params.eventId}.zip`, (err) => {
        // Temizlik
        fs.rmSync(qrDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(qrDir, false);
    await archive.finalize();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
