const nodemailer = require('nodemailer');

class NotificationController {
    static async createNotification(req, res) {
        // Extrae los datos del destinatario, asunto y contenido del cuerpo de la solicitud
        const { to, subject, text } = req.body;

        // Configura el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.titan.email',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, // Tu correo electrónico
                pass: process.env.EMAIL_PASS, // Tu contraseña
            }
        });        

        // Define las opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER, // El correo del remitente, obtenido de variables de entorno
            to: to, // Dirección de correo del destinatario (por ejemplo, 'destinatario@ejemplo.com')
            subject: subject, // Asunto del correo (por ejemplo, 'Asunto de prueba')
            text: text // Cuerpo del mensaje en texto plano (por ejemplo, 'Este es el contenido del correo')
        };

        try {
            // Envia el correo
            const info = await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Correo enviado exitosamente', info });
        } catch (error) {
            console.error('Error al enviar el correo: %s', error);
            res.status(500).json({ message: 'Error al enviar el correo', error });
        }
    }
}

module.exports = NotificationController;