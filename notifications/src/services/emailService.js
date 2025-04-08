const nodemailer = require('nodemailer');
const templateService = require('./templateService');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.titan.email',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
    }

    /**
     * Envía un correo electrónico
     * @param {string} to - Destinatario
     * @param {string} subject - Asunto
     * @param {string} type - Tipo de plantilla
     * @param {Object} data - Datos para la plantilla
     * @returns {Promise<Object>} - Resultado del envío
     */
    async sendEmail(to, subject, type, data) {
        // Verificar que se proporcionen los datos necesarios
        if (!to || !subject || !type) {
            throw new Error('Faltan datos requeridos para enviar el correo');
        }

        // Genera el HTML del correo
        const htmlContent = templateService.generateEmailHTML(type, data);

        // Define las opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        try {
            // Envia el correo
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Correo enviado exitosamente', info };
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error;
        }
    }

    /**
     * Envía un recordatorio basado en el tipo
     * @param {Object} user - Datos del usuario
     * @param {string} reminderType - Tipo de recordatorio
     * @param {Object} additionalData - Datos adicionales
     * @returns {Promise<Object>} - Resultado del envío
     */
    async sendReminder(user, reminderType, additionalData = {}) {
        // Configuración específica para cada tipo de recordatorio
        const reminderConfig = {
            inactivity: {
                subject: '¡Te extrañamos en MindUp!',
                type: 'inactivityReminder',
                data: {
                    name: user.fullname || 'Estudiante',
                    daysInactive: additionalData.daysInactive || 7,
                    ...additionalData
                }
            },
            courseProgress: {
                subject: 'Continúa aprendiendo en MindUp',
                type: 'courseProgressReminder',
                data: {
                    name: user.fullname || 'Estudiante',
                    courseName: additionalData.courseName || 'tu curso',
                    progress: additionalData.progress || 0,
                    ...additionalData
                }
            },
            subscription: {
                subject: 'Información sobre tu suscripción en MindUp',
                type: 'subscriptionReminder',
                data: {
                    name: user.fullname || 'Estudiante',
                    expirationDate: additionalData.expirationDate,
                    daysRemaining: additionalData.daysRemaining,
                    ...additionalData
                }
            }
        };

        // Verifica si existe configuración para el tipo de recordatorio
        if (!reminderConfig[reminderType]) {
            throw new Error(`Tipo de recordatorio no soportado: ${reminderType}`);
        }

        const config = reminderConfig[reminderType];
        
        // Envía el correo
        return await this.sendEmail(
            user.email,
            config.subject,
            config.type,
            config.data
        );
    }
}

module.exports = new EmailService();