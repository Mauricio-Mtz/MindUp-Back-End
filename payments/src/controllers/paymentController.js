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
        const { orderId, studentId, amount } = req.body;
    
        try {
            // Llamar a la función capturePayment para obtener el status y orderId
            const { transactionId, status } = await PaypalService.capturePayment(orderId);
    
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
    static async createMercadoPagoPayment(req, res) {
        try {
            const { studentId, items } = req.body;
            const preference = await MercadoPagoService.createPaymentPreference(items, studentId);
            
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
    static async paymentWebhook(req, res) {
        const paymentData = req.body;

        try {
            const { id, status, payment_type, transaction_amount, description, additional_info } = paymentData;
            console.log("INFORMACION DEL PAGO: ", paymentData)

            console.log("ID", id);
            console.log("status", status);
            console.log("payment_type", payment_type);
            console.log("transaction_amount", transaction_amount);
            console.log("description", description);
            console.log("studentId desde additional_info:", additional_info?.studentId);  // Acceder a studentId

            // Ahora puedes guardar la información en tu base de datos
            const studentId = additional_info?.studentId;

            // Llama al modelo para guardar la información en la base de datos
            await PaymentModel.createPaymentRecord('mercadopago', id, status, transaction_amount, studentId);

            res.sendStatus(200);  // Confirmar recepción del webhook
        } catch (error) {
            console.error('Error al procesar el webhook:', error);
            res.sendStatus(500);
        }
    };
}

module.exports = paymentController;
