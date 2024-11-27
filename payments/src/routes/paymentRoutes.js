const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/getPaymentsByStudent', paymentController.getPaymentsByStudent);
router.get('/getSubscriptionStatusByStudent', paymentController.getSubscriptionStatusByStudent);

// Rutas para PayPal
router.post('/create-paypal-order', paymentController.createPaypalOrder);
router.post('/capture-paypal-payment', paymentController.capturePaypalPayment);

// Rutas para MercadoPago
router.post('/create-mercadopago-preference', paymentController.createMercadoPagoPreference);
router.post('/receive-mercadopago-webhook', paymentController.receiveWebhook);

module.exports = router;
