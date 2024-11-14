const express = require('express');
const ReportController = require('../controllers/reportController');

const router = express.Router();

// Cambiar a POST para enviar datos en el cuerpo
router.post('/getReport', ReportController.getReport);

module.exports = router;
