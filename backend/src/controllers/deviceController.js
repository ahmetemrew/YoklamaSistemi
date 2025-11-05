const Device = require('../models/Device');

exports.getAllDevices = (req, res) => {
  try {
    const devices = Device.getAll();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOnlineDevices = (req, res) => {
  try {
    const devices = Device.getOnline();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerDevice = (req, res) => {
  try {
    const device = Device.register(req.body);

    // Socket.io ile bildirim gönder
    if (req.io) {
      req.io.emit('device:registered', device);
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateActivity = (req, res) => {
  try {
    const device = Device.updateActivity(req.params.id);
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDevice = (req, res) => {
  try {
    Device.delete(req.params.id);
    res.json({ message: 'Cihaz silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
