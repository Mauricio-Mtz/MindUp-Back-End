// services/SubscriptionService.js
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

class SubscriptionService {

    static async procesarPagoYActualizarSuscripcion(method, transactionId, status, amount, studentId) {
        try {
            const currentDate = new Date();
            const endDate = new Date(currentDate);
            endDate.setMonth(endDate.getMonth() + 1);
    
            // Obtener la suscripción actual del estudiante
            const [existingSubscription] = await Subscription.findByStudentId(studentId);
    
            let subscriptionId;
    
            if (existingSubscription) {
                subscriptionId = existingSubscription.id;
    
                if (existingSubscription.status === 'active') {
                    // Si está activa, extender la fecha de expiración en un mes
                    const newEndDate = new Date(existingSubscription.end_date);
                    newEndDate.setMonth(newEndDate.getMonth() + 1);
                    await Subscription.updateSubscriptionEndDate(subscriptionId, newEndDate);
                } else if (existingSubscription.status === 'expired' || existingSubscription.status === 'cancelled') {
                    // Si está expirada o cancelada, reiniciar la fecha de inicio y fin, y cambiar el estado a activo
                    await Subscription.updateSubscriptionDatesAndStatus(
                        subscriptionId,
                        currentDate,
                        endDate,
                        'active'
                    );
                }
            } else {
                // Si no existe ninguna suscripción, crear una nueva
                subscriptionId = await Subscription.createOrExtendSubscription(
                    studentId,
                    currentDate,
                    endDate,
                    'active'
                );
            }
    
            // Marcar pagos anteriores como no actuales
            await Payment.markPreviousPaymentsAsNotCurrent(subscriptionId);
    
            // Registrar el nuevo pago
            await Payment.createPaymentRecord(transactionId, method, status, amount, subscriptionId);
    
            console.log(`Pago registrado para suscripción ID ${subscriptionId}.`);
            return subscriptionId;
        } catch (error) {
            console.error('Error al procesar el pago y actualizar la suscripción:', error);
            throw error;
        }
    }

    static async validarSuscripciones() {
        try {
            const hoy = new Date();
            const cincoDiasAntes = new Date(hoy);
            cincoDiasAntes.setDate(cincoDiasAntes.getDate() + 5);
    
            // Busca suscripciones que expiran en los próximos 5 días o que ya expiraron
            const suscripciones = await Subscription.findExpiringSubscriptions(5);
    
            for (const suscripcion of suscripciones) {
                const fechaExpiracion = new Date(suscripcion.end_date);
                const fechaFormateada = fechaExpiracion.toLocaleDateString('es-MX', {
                    weekday: 'long', // Día de la semana, ej. "lunes"
                    year: 'numeric', // Año, ej. "2024"
                    month: 'long',   // Mes, ej. "noviembre"
                    day: 'numeric',  // Día, ej. "14"
                });
    
                if (fechaExpiracion < hoy) {
                    // La suscripción ya ha expirado, se marca como 'expired'
                    await Subscription.updateSubscriptionStatus(suscripcion.id, 'expired');
                    await SubscriptionService.enviarNotificacion(suscripcion.email, suscripcion.id, fechaFormateada, 'expired');
    
                    console.log(`Suscripción ID ${suscripcion.id} ha sido marcada como 'expired'.`);
                } else if (fechaExpiracion <= cincoDiasAntes) {
                    // La suscripción expirará en 5 días o menos
                    await SubscriptionService.enviarNotificacion(suscripcion.email, suscripcion.id, fechaFormateada, 'expiring');
                    
                    console.log(`Suscripción ID ${suscripcion.id} expirará en 5 días o menos.`);
                }
            }
    
            console.log('Validación de suscripciones completada.');
        } catch (error) {
            console.error('Error al validar suscripciones:', error);
        }
    }
    
    // Función para enviar la notificación por correo
    static async enviarNotificacion(email, subscriptionId, fechaExpiracion, status) {
        try {
            // Enviar correo de notificación
            await fetch('http://localhost:3000/notifications/createNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que el cuerpo es JSON
                },
                body: JSON.stringify({
                    to: email,  // Correo del estudiante
                    subject: status === 'expired' ? "Suscripción expirada" : "Suscripción a punto de expirar",
                    text: `Hola,\n\nTu suscripción a MindUp ${status === 'expired' ? `ha expirado el dia ${fechaExpiracion}` : `expirará el ${fechaExpiracion}`}.
            
                        ${status === 'expired' ? 'Tu acceso a los cursos se ha desactivado.' : 'Recuerda que debes renovar tu suscripción para seguir accediendo a los cursos y materiales educativos en MindUp.'}
            
                        Si tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.
            
                        ¡Gracias por ser parte de la comunidad MindUp!
            
                        Saludos,\nEl equipo de MindUp`
                }),
            });
    
            console.log(`Notificación enviada a ${email} sobre la suscripción ${subscriptionId}`);
        } catch (error) {
            console.error('Error al enviar la notificación:', error);
        }
    }    
}

module.exports = SubscriptionService;