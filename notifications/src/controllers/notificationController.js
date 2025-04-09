const nodemailer = require('nodemailer');

class NotificationController {
    // Método principal para crear y enviar notificaciones
    static async createNotification(req, res) {
        // Extrae todos los datos necesarios del cuerpo de la solicitud
        const { to, subject, type, data } = req.body;
        console.log(req.body)

        // Configura el transporte
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu correo electrónico
                pass: process.env.EMAIL_PASS, // Tu contraseña
            }
        }); 

        // Verifica que se proporcionen los datos necesarios
        if (!to || !subject || !type) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos para enviar el correo' 
            });
        }

        // Genera el HTML y el texto plano del correo
        const htmlContent = NotificationController.generateEmailHTML(type, data);

        // Define las opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        try {
            // Envia el correo
            const info = await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Correo enviado exitosamente', info });
        } catch (error) {
            console.error('Error al enviar el correo: %s', error);
            res.status(500).json({ 
                message: 'Error al enviar el correo', 
                error,
                data: {
                    htmlContent
                }  
            });
        }
    }

    // Método para generar HTML de forma dinámica
    static generateEmailHTML(type, data) {
        // Objeto con diferentes plantillas HTML
        const templates = {
            // Plantilla para bienvenida después del registro
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

            // Plantilla para confirmación de pago (PayPal)
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

            // Plantilla para confirmación de pago (MercadoPago)
            paymentMercadoPago: (data) => `
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
                                <p><strong>Método de pago:</strong> MercadoPago</p>
                                <p><strong>ID de transacción:</strong> ${data.paymentId}</p>
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

            // Plantilla para notificación de suscripción (expiración o próxima a expirar)
            subscriptionNotice: (data) => `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: ${data.status === 'expired' ? '#FF6347' : '#FFA500'}; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${data.status === 'expired' ? 'Suscripción Expirada' : 'Suscripción a Punto de Expirar'}</h1>
                        </div>
                        <div class="content">
                            <p>Hola,</p>
                            <p>Tu suscripción a MindUp ${data.status === 'expired' ? `ha expirado el dia ${data.expirationDate}` : `expirará el ${data.expirationDate}`}.</p>
                            
                            <p>${data.status === 'expired' ? 'Tu acceso a los cursos se ha desactivado.' : 'Recuerda que debes renovar tu suscripción para seguir accediendo a los cursos y materiales educativos en MindUp.'}</p>
                            
                            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                            
                            <p>¡Gracias por ser parte de la comunidad MindUp!</p>
                            
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Plantilla para inscripción a curso
            courseEnrollment: (data) => `
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
                            <h1>¡Inscripción a Curso!</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${data.name},</p>
                            <p>¡Felicidades! Te has inscrito con éxito en el curso "${data.courseName}" en MindUp.</p>
                            
                            <p>A continuación, podrás acceder a los materiales del curso y comenzar tu aprendizaje. Estamos aquí para apoyarte en cada paso del camino.</p>
                            
                            <p>Recuerda que, además del curso, tienes acceso a todas las herramientas que ofrecemos para optimizar tu experiencia. Aprovecha al máximo tu tiempo y aprende con nosotros.</p>
                            
                            <p>Si tienes alguna pregunta, puedes ponerte en contacto con nuestro equipo de soporte en cualquier momento.</p>
                            
                            <p>¡Bienvenido a la comunidad MindUp!</p>
                            
                            <p>Saludos,<br>El equipo de MindUp</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            
            // Plantilla para verificacion de correo
            verifyEmail: (data) => `
                 <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
                        .header { background-color: #004c83; color: white; padding: 10px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                        .code { font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0; }
                        .footer { font-size: 12px; color: #777; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Verificación de Correo Electrónico</h1>
                        </div>
                        <div class="content">
                            <p>Hola,</p>
                            <p>Gracias por registrarte. Para completar el proceso de verificación, utiliza el siguiente código:</p>
                            <div class="code">${data.verificationCode}</div>
                            <p>Si no solicitaste este código, por favor ignora este mensaje.</p>
                        </div>
                        <div class="footer">
                            <p>Este mensaje fue enviado automáticamente. Por favor, no respondas a este correo.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,

            // Plantilla por defecto para otros tipos de notificaciones
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
                </html>
            `,
        }    
        
        // Verifica si el tipo existe, si no usa el template por defecto
        const templateFunction = templates[type] || templates.default;
        return templateFunction(data);
    }
}

module.exports = NotificationController;