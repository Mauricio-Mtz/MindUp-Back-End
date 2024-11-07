const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/getPaymentsByStudent', paymentController.getPaymentsByStudent);
// router.post('/pay', paymentController.pay);

module.exports = router;
