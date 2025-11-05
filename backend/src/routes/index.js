const express = require('express');
const multer = require('multer');

const eventController = require('../controllers/eventController');
const participantController = require('../controllers/participantController');
const attendanceController = require('../controllers/attendanceController');
const deviceController = require('../controllers/deviceController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Event routes
router.get('/events', eventController.getAllEvents);
router.get('/events/active', eventController.getActiveEvents);
router.get('/events/:id', eventController.getEventById);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.get('/events/:id/stats', eventController.getEventStats);

// Participant routes
router.get('/events/:eventId/participants', participantController.getParticipantsByEvent);
router.get('/participants/:id', participantController.getParticipantById);
router.post('/participants', participantController.createParticipant);
router.post('/participants/import', upload.single('file'), participantController.importParticipants);
router.put('/participants/:id', participantController.updateParticipant);
router.delete('/participants/:id', participantController.deleteParticipant);
router.get('/events/:eventId/qrcodes', participantController.generateQRCodes);

// Attendance routes
router.post('/attendance/scan', attendanceController.scanQRCode);
router.get('/events/:eventId/attendance', attendanceController.getAttendanceByEvent);
router.get('/attendance/recent', attendanceController.getRecentScans);
router.delete('/attendance/:id', attendanceController.deleteAttendance);

// Device routes
router.get('/devices', deviceController.getAllDevices);
router.get('/devices/online', deviceController.getOnlineDevices);
router.post('/devices/register', deviceController.registerDevice);
router.put('/devices/:id/activity', deviceController.updateActivity);
router.delete('/devices/:id', deviceController.deleteDevice);

module.exports = router;
