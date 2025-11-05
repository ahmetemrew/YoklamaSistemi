const Event = require('../models/Event');
const Participant = require('../models/Participant');

exports.getAllEvents = (req, res) => {
  try {
    const events = Event.getAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveEvents = (req, res) => {
  try {
    const events = Event.getActive();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventById = (req, res) => {
  try {
    const event = Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }
    const stats = Event.getStats(req.params.id);
    res.json({ ...event, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEvent = (req, res) => {
  try {
    const event = Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateEvent = (req, res) => {
  try {
    const event = Event.update(req.params.id, req.body);
    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteEvent = (req, res) => {
  try {
    Event.delete(req.params.id);
    res.json({ message: 'Etkinlik silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventStats = (req, res) => {
  try {
    const stats = Event.getStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
