/**
 * Servicio para generar plantillas HTML de correos
 */
class TemplateService {
    /**
     * Genera el HTML para los correos según el tipo
     * @param {string} type - Tipo de plantilla
     * @param {Object} data - Datos para la plantilla
     * @returns {string} - HTML generado
     */
    generateEmailHTML(type, data) {
        // Objeto con diferentes plantillas HTML
        const templates = {
            // Plantilla para bienvenida después del registro (existente)
            welcome: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: #004c83; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Bienvenido a MindUp!</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${data.name},</p>
                            <p>¡Gracias por registrarte en MindUp! Estamos emocionados de tenerte con nosotros. Tu cuenta ha sido creada con éxito.</p>
                            <p>Ahora podrás comenzar a aprovechar todos los beneficios que ofrecemos.</p>
                            <p>Si tienes alguna duda o necesitas ayuda, no dudes en ponerte en contacto con nuestro soporte.</p>
                            <p>¡Bienvenido a la comunidad de MindUp!</p>
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Plantilla para confirmación de pago (PayPal) (existente)
            paymentPaypal: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: #004c83; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                        .details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Confirmación de Pago - MindUp</h1>
                        </div>
                        <div class="content">
                            <p>Hola,</p>
                            <p>¡Gracias por tu pago! Hemos recibido con éxito tu suscripción a MindUp.</p>
                            
                            <div class="details">
                                <h3>Detalles de la Transacción</h3>
                                <p><strong>Método de pago:</strong> PayPal</p>
                                <p><strong>ID de transacción:</strong> ${data.transactionId}</p>
                                <p><strong>Estado de la transacción:</strong> ${data.status}</p>
                                <p><strong>Monto pagado:</strong> $${data.amount.toFixed(2)}</p>
                                <p><strong>Fecha de pago:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>

                            <p>Gracias a tu pago, ahora tienes acceso completo a los cursos y materiales educativos en MindUp.</p>
                            <p>Puedes comenzar tu aprendizaje de inmediato y aprovechar todos los beneficios que ofrecemos.</p>
                            
                            <p>Si en cualquier momento tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                            
                            <p>¡Bienvenido a la comunidad MindUp, y disfruta de tu experiencia educativa con nosotros!</p>
                            
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Aquí añadimos las nuevas plantillas para recordatorios

            // Recordatorio por inactividad
            inactivityReminder: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: #4A90E2; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                        .cta-button { background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Te extrañamos en MindUp!</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${data.name},</p>
                            <p>Hemos notado que han pasado ${data.daysInactive} días desde tu última visita a MindUp. ¡Te estamos extrañando!</p>
                            <p>Continuar con tu aprendizaje es importante para alcanzar tus metas. ¿Por qué no regresas hoy y retomas tu camino educativo?</p>
                            <p>Recuerda que tienes acceso a todos nuestros cursos y materiales. ¡No pierdas el impulso que habías logrado!</p>
                            <p>Si tienes alguna dificultad o pregunta, nuestro equipo de soporte está siempre disponible para ayudarte.</p>
                            <a href="${process.env.APP_URL || 'https://mindup.edu'}" class="cta-button">Volver a aprender</a>
                            <p>¡Esperamos verte pronto de nuevo!</p>
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Recordatorio de progreso en curso
            courseProgressReminder: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: #28A745; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                        .progress-bar { background-color: #e0e0e0; height: 20px; border-radius: 10px; margin: 20px 0; }
                        .progress { background-color: #28A745; height: 20px; border-radius: 10px; width: ${data.progress}%; }
                        .cta-button { background-color: #28A745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Continúa tu aprendizaje en MindUp</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${data.name},</p>
                            <p>Estás haciendo un gran trabajo en tu curso "${data.courseName}". ¡Ya has completado el ${data.progress}% del contenido!</p>
                            
                            <div class="progress-bar">
                                <div class="progress"></div>
                            </div>
                            
                            <p>¿Sabías que los estudiantes que mantienen una rutina regular de estudio tienen un 80% más de probabilidades de completar sus cursos?</p>
                            <p>No pierdas el impulso. ¡Te invitamos a continuar con la siguiente lección hoy!</p>
                            
                            <a href="${process.env.APP_URL || 'https://mindup.edu'}/courses/${data.courseId}" class="cta-button">Continuar aprendiendo</a>
                            
                            <p>Si necesitas ayuda con algún tema, recuerda que estamos aquí para apoyarte.</p>
                            <p>¡Sigue adelante!</p>
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Recordatorio de suscripción
            subscriptionReminder: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: ${data.daysRemaining <= 3 ? '#DC3545' : '#FFC107'}; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                        .cta-button { background-color: #004c83; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${data.daysRemaining <= 0 ? 'Tu suscripción ha expirado' : 'Tu suscripción está por expirar'}</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${data.name},</p>
                            
                            ${data.daysRemaining <= 0 ? 
                                `<p>Tu suscripción a MindUp ha <strong>expirado</strong> el día ${data.expirationDate}.</p>
                                <p>Lamentablemente, ya no tienes acceso a nuestros cursos y materiales educativos.</p>` 
                                : 
                                `<p>Tu suscripción a MindUp expirará en <strong>${data.daysRemaining} día(s)</strong> (${data.expirationDate}).</p>
                                <p>Para seguir disfrutando de acceso completo a todos nuestros cursos y materiales, te recomendamos renovar tu suscripción antes de la fecha de vencimiento.</p>`
                            }
                            
                            <p>Renovar tu suscripción es muy sencillo y podrás continuar tu camino de aprendizaje sin interrupciones.</p>
                            
                            <a href="${process.env.APP_URL || 'https://mindup.edu'}/subscription/renew" class="cta-button">Renovar ahora</a>
                            
                            <p>Si tienes alguna pregunta sobre tu suscripción o necesitas ayuda, nuestro equipo de soporte está disponible para asistirte.</p>
                            
                            <p>Gracias por ser parte de la comunidad MindUp.</p>
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Aquí puedes añadir todas tus plantillas existentes
            // ...

            // Plantilla por defecto para otros tipos de notificaciones (existente)
            default: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: #007bff; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Notificación de MindUp</h1>
                        </div>
                        <div class="content">
                            <p>Hola,</p>
                            <p>Tienes una nueva notificación de MindUp.</p>
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        // Verifica si el tipo existe, si no usa el template por defecto
        const templateFunction = templates[type] || templates.default;
        return templateFunction(data);
    }
}

module.exports = new TemplateService();