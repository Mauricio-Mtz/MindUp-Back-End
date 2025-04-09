const emailService = require('../services/emailService');
const db = require('../utils/dbUtils');

class ReminderController {
    /**
     * Actualiza las preferencias de notificación de un estudiante
     * @param {Request} req - Objeto de solicitud Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async updateNotificationPreferences(req, res) {
        try {
            const { studentId, preferences } = req.body;

            if (!studentId || !preferences) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere el ID del estudiante y las preferencias'
                });
            }

            // Actualiza las preferencias en la base de datos
            await db.query(
                'UPDATE students SET notification_preferences = ? WHERE id = ?',
                [JSON.stringify(preferences), studentId]
            );

            res.status(200).json({
                success: true,
                message: 'Preferencias de notificación actualizadas con éxito'
            });
        } catch (error) {
            console.error('Error al actualizar preferencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar las preferencias de notificación',
                error: error.message
            });
        }
    }

    /**
     * Envía manualmente un recordatorio a un estudiante específico
     * @param {Request} req - Objeto de solicitud Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async sendManualReminder(req, res) {
        try {
            const { studentId, reminderType, additionalData } = req.body;

            if (!studentId || !reminderType) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere el ID del estudiante y el tipo de recordatorio'
                });
            }

            // Obtiene información del estudiante
            const [student] = await db.query(
                'SELECT id, email, fullname, notification_preferences FROM students WHERE id = ?',
                [studentId]
            );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            // Verifica si el estudiante ha desactivado las notificaciones
            const preferences = student.notification_preferences ? 
                JSON.parse(student.notification_preferences) : 
                { emailNotifications: true };

            if (preferences.emailNotifications === false) {
                return res.status(200).json({
                    success: false,
                    message: 'El estudiante ha desactivado las notificaciones por correo'
                });
            }

            // Envía el recordatorio
            const result = await emailService.sendReminder(
                student,
                reminderType,
                additionalData
            );

            res.status(200).json({
                success: true,
                message: 'Recordatorio enviado con éxito',
                result
            });
        } catch (error) {
            console.error('Error al enviar recordatorio manual:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar el recordatorio',
                error: error.message
            });
        }
    }

    /**
     * Obtiene las preferencias de notificación de un estudiante
     * @param {Request} req - Objeto de solicitud Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async getNotificationPreferences(req, res) {
        try {
            const { studentId } = req.params;

            if (!studentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere el ID del estudiante'
                });
            }

            // Obtiene las preferencias de la base de datos
            const [student] = await db.query(
                'SELECT notification_preferences FROM students WHERE id = ?',
                [studentId]
            );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            // Parseamos las preferencias (o usamos valores predeterminados)
            const preferences = student.notification_preferences ? 
                JSON.parse(student.notification_preferences) : 
                { reminderFrequency: 'weekly', emailNotifications: true };

            res.status(200).json({
                success: true,
                preferences
            });
        } catch (error) {
            console.error('Error al obtener preferencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener preferencias de notificación',
                error: error.message
            });
        }
    }

    /**
     * Marca última actividad del estudiante
     * @param {Request} req - Objeto de solicitud Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async trackActivity(req, res) {
        try {
            const { studentId, activityType } = req.body;

            console.log("STUDENT ID: ", studentId)
            console.log("ACTIVITY TYPE: ", activityType)

            if (!studentId || !activityType) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere el ID del estudiante y el tipo de actividad'
                });
            }

            // Mapea los tipos de actividad a los campos de la base de datos
            const activityFields = {
                login: 'last_login',
                courseAccess: 'last_course_access',
                moduleCompleted: 'last_module_completed'
            };

            const field = activityFields[activityType];
            if (!field) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de actividad no válido'
                });
            }

            // Verifica si el estudiante existe en la tabla student_activity
            const [exists] = await db.query(
                'SELECT 1 FROM student_activity WHERE student_id = ?',
                [studentId]
            );

            if (exists) {
                // Actualiza el campo correspondiente
                await db.query(
                    `UPDATE student_activity SET ${field} = CURRENT_TIMESTAMP WHERE student_id = ?`,
                    [studentId]
                );
            } else {
                // Crea un nuevo registro
                await db.query(
                    'INSERT INTO student_activity (student_id) VALUES (?)',
                    [studentId]
                );
            }

            res.status(200).json({
                success: true,
                message: 'Actividad registrada con éxito'
            });
        } catch (error) {
            console.error('Error al registrar actividad:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar la actividad',
                error: error.message
            });
        }
    }
}

module.exports = ReminderController;