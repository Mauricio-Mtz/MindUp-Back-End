const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/getPaymentsByStudent', paymentController.getPaymentsByStudent);

// Rutas para PayPal
router.post('/create-paypal-order', paymentController.createPaypalOrder);
router.post('/capture-paypal-payment', paymentController.capturePaypalPayment);

// Rutas para MercadoPago
router.post('/create-mercadopago-payment', paymentController.createMercadoPagoPayment);
router.post('/webhook-mercadopago-payment', paymentController.paymentWebhook);

module.exports = router;
