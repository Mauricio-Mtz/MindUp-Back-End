const express = require('express');
const ReminderController = require('../controllers/reminderController');

const router = express.Router();

// Ruta para actualizar preferencias de notificación
router.put('/preferences', ReminderController.updateNotificationPreferences);

// Ruta para obtener preferencias de notificación
router.get('/preferences/:studentId', ReminderController.getNotificationPreferences);

// Ruta para enviar un recordatorio manual
router.post('/send', ReminderController.sendManualReminder);

// Ruta para rastrear actividad de un estudiante
router.post('/track-activity', ReminderController.trackActivity);

module.exports = router;