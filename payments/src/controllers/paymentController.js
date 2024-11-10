const Student = require('../models/Student');
const PaymentModel = require('../models/Payment');

const PaypalService = require('../services/paypalService');
const MercadoPagoService = require('../services/mercadoPagoService');

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
                const paymentRecord = await PaymentModel.createPaymentRecord('PayPal', transactionId, status, amount, studentId);
    
                res.json({ message: 'Pago completado correctamente.' });
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
            const data = await MercadoPagoService.getPaymentDetails(paymentId);
            const { external_reference, transaction_amount, collection_status } = data;
            const studentId = await Student.findByEmail(external_reference);

            await PaymentModel.createPaymentRecord('mercadopago', paymentId, collection_status, transaction_amount, studentId);

            res.sendStatus(200);
        } catch (error) {
            console.error('Error al procesar el webhook en PaymentController:', error);
            res.sendStatus(500);
        }
    }
}

module.exports = paymentController;
