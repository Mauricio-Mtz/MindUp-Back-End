const Student = require('../models/Student');
const PaymentModel = require('../models/Payment');

const PaypalService = require('../services/paypalService');
const MercadoPagoService = require('../services/mercadoPagoService');
const SubscriptionService = require('../services/subscriptionService');

class paymentController {
    static async getPaymentsByStudent(req, res) {
        const { email } = req.query;
        let payments = [];
        try {
            // Buscar el historial de pagos segun el usuario
            payments = await Student.getPaymentsByStudent(email);
            if (payments.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No hay historial que mostrar.',
                    data: payments,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Pagos obtenidos correctamente.',
                    data: payments,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Búsqueda de pagos fallida.',
                error: error.message,
            });
        }
    }
    static async getSubscriptionStatusByStudent(req, res) {
        const { email } = req.query;
        let subscriptionStatus = null;
        try {
            // Buscar el estado de la suscripción según el email del estudiante
            subscriptionStatus = await Student.getSubscriptionStatusByStudent(email);
    
            if (!subscriptionStatus) {
                return res.status(200).json({
                    success: false,
                    message: 'No hay registros de suscripción para este estudiante.',
                    data: subscriptionStatus,
                });
            }
    
            // Validar el estado de la suscripción
            if (subscriptionStatus === 'active') {
                return res.status(200).json({
                    success: true,
                    message: 'La suscripción está activa.',
                    data: subscriptionStatus,
                });
            } else if (subscriptionStatus === 'expired') {
                return res.status(200).json({
                    success: false,
                    message: 'La suscripción ha expirado.',
                    data: subscriptionStatus,
                });
            } else if (subscriptionStatus === 'cancelled') {
                return res.status(200).json({
                    success: false,
                    message: 'La suscripción ha sido cancelada.',
                    data: subscriptionStatus,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'El estado de la suscripción es desconocido.',
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al buscar el estado de la suscripción.',
                error: error.message,
            });
        }
    }    

    static async createPaypalOrder(req, res) {
        const { amount, currency } = req.body;
        
        try {
            const { orderId } = await PaypalService.createOrder(amount, currency);
            res.json({ orderId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el pedido con PayPal.', error });
        }
    }    
    
    // Ejecutar el pago con PayPal
    static async capturePaypalPayment(req, res) {
        const { orderId, studentEmail, amount } = req.body;
    
        try {
            // Llamar a la función capturePayment para obtener el status y orderId
            const { transactionId, status } = await PaypalService.capturePayment(orderId);
            const studentId = await Student.findByEmail(studentEmail);
    
            if (status === 'COMPLETED') {  // Verificar si el pago fue exitoso
                // Registrar el pago en la base de datos usando el transactionId y el status
                await SubscriptionService.procesarPagoYActualizarSuscripcion('PayPal', transactionId, status, amount, studentId);

                await fetch('http://localhost:3000/notifications/createNotification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: studentEmail,
                        subject: "Confirmación de pago y acceso a MindUp",
                        type: "paymentPaypal",
                        data: {
                            transactionId: transactionId,
                            status: status,
                            amount: amount
                        }
                    })
                });               
                
                res.json({ status: status, message: 'Pago completado correctamente.' });
            } else {
                res.status(400).json({ message: 'Pago fallido.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al ejecutar el pago con PayPal.' });
        }
    }

    // Crear una preferencia de pago y devolver el ID al frontend
    static async createMercadoPagoPreference(req, res) {
        try {
            const { studentEmail, items } = req.body;
            const preference = await MercadoPagoService.createPaymentPreference(items, studentEmail);

            // Verifica que el objeto de respuesta tenga un id
            if (!preference.id) {
                throw new Error("No se encontró el ID en la respuesta de MercadoPago");
            }
            res.json({ id: preference.id });
        } catch (error) {
            console.error("Error en el controlador:", error);
            res.status(500).json({ error: error.message });
        }
    }
    
    // Webhook para recibir actualizaciones de Mercado Pago
    static async receiveWebhook(req, res) {
        const paymentId = req.query.id;
    
        try {
            // Obtén los detalles del pago
            const data = await MercadoPagoService.getPaymentDetails(paymentId);
            const { external_reference, status, transaction_amount } = data;
    
            // Aceptamos solo los estados 'approved', 'pending' o 'rejected'
            if (!['approved', 'pending', 'rejected'].includes(status)) {
                console.log(`Estado no válido recibido: ${status}`);
                return res.sendStatus(200); // Responde para evitar más intentos de reenvío
            }
    
            // Busca al estudiante asociado al pago
            const studentId = await Student.findByEmail(external_reference);
            // Crea el registro de pago
            await SubscriptionService.procesarPagoYActualizarSuscripcion('mercadopago', paymentId, status, transaction_amount, studentId);
            
            await fetch('http://localhost:3000/notifications/createNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: external_reference,
                    subject: "Confirmación de pago y acceso a MindUp",
                    type: "paymentMercadoPago",
                    data: {
                        paymentId: paymentId,
                        status: status,
                        amount: transaction_amount
                    }
                })
            });     
    
            res.sendStatus(200);
        } catch (error) {
            console.error('Error al procesar el webhook en PaymentController:', error);
            res.sendStatus(500);
        }
    }
}

module.exports = paymentController;
