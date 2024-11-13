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
                await PaymentModel.createPaymentRecord('PayPal', transactionId, status, amount, studentId);

                await fetch('http://localhost:3000/notifications/createNotification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Indica que el cuerpo es JSON
                    },
                    body: JSON.stringify({
                        to: studentEmail,  // Dirección de correo del destinatario (el correo del usuario registrado)
                        subject: "Confirmación de pago y acceso a MindUp", // Asunto del correo
                        text: `Hola,\n\n¡Gracias por tu pago! Hemos recibido con éxito tu suscripción a MindUp. Aquí están los detalles de tu pago:
                
                                - **Método de pago**: PayPal  
                                - **ID de transacción**: ${transactionId}  
                                - **Estado de la transacción**: ${status}  
                                - **Monto pagado**: $${amount.toFixed(2)}  
                                - **Fecha de pago**: ${new Date().toLocaleDateString()}
                
                                Gracias a tu pago, ahora tienes acceso completo a los cursos y materiales educativos en MindUp. Puedes comenzar tu aprendizaje de inmediato y aprovechar todos los beneficios que ofrecemos.
                
                                Si en cualquier momento tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.
                
                                ¡Bienvenido a la comunidad MindUp, y disfruta de tu experiencia educativa con nosotros!
                
                                Saludos,\nEl equipo de MindUp` // Cuerpo del correo con los detalles del pago y bienvenida
                    }),
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
            await PaymentModel.createPaymentRecord('mercadopago', paymentId, status, transaction_amount, studentId);
            
            await fetch('http://localhost:3000/notifications/createNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que el cuerpo es JSON
                },
                body: JSON.stringify({
                    to: external_reference,  // Dirección de correo del destinatario (el correo del usuario registrado)
                    subject: "Confirmación de pago y acceso a MindUp", // Asunto del correo
                    text: `Hola,\n\n¡Gracias por tu pago! Hemos recibido con éxito tu suscripción a MindUp. Aquí están los detalles de tu pago:
            
                            - **Método de pago**: MercadoPago 
                            - **ID de transacción**: ${paymentId}  
                            - **Estado de la transacción**: ${status}  
                            - **Monto pagado**: $${transaction_amount.toFixed(2)}  
                            - **Fecha de pago**: ${new Date().toLocaleDateString()}
            
                            Gracias a tu pago, ahora tienes acceso completo a los cursos y materiales educativos en MindUp. Puedes comenzar tu aprendizaje de inmediato y aprovechar todos los beneficios que ofrecemos.
            
                            Si en cualquier momento tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.
            
                            ¡Bienvenido a la comunidad MindUp, y disfruta de tu experiencia educativa con nosotros!
            
                            Saludos,\nEl equipo de MindUp` // Cuerpo del correo con los detalles del pago y bienvenida
                }),
            });      
    
            res.sendStatus(200);
        } catch (error) {
            console.error('Error al procesar el webhook en PaymentController:', error);
            res.sendStatus(500);
        }
    }    
}

module.exports = paymentController;
