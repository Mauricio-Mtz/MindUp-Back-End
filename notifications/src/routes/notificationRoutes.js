const express = require('express');
const NotificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/createNotification', NotificationController.createNotification);

module.exports = router;
