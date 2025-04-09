const db = require('../../utils/dbUtils');
const emailService = require('../../services/emailService');
const DateUtils = require('../../utils/dateUtils');

/**
 * Trabajo para enviar recordatorios a estudiantes inactivos
 */
class InactivityReminderJob {
    /**
     * Ejecuta el trabajo de recordatorios por inactividad
     */
    async execute() {
        try {
            console.log('Iniciando trabajo de recordatorios por inactividad...');
            
            // Buscar estudiantes inactivos (que no han iniciado sesión en 7 días o más)
            const inactiveStudents = await this.findInactiveStudents();
            console.log(`Se encontraron ${inactiveStudents.length} estudiantes inactivos.`);
            
            // Enviar recordatorios
            const results = await this.sendReminders(inactiveStudents);
            
            console.log(`Recordatorios por inactividad enviados: ${results.sent}`);
            console.log(`Recordatorios por inactividad omitidos: ${results.skipped}`);
            
            return {
                success: true,
                sent: results.sent,
                skipped: results.skipped
            };
        } catch (error) {
            console.error('Error al ejecutar trabajo de recordatorios por inactividad:', error);
            throw error;
        }
    }

    /**
     * Encuentra estudiantes que no han iniciado sesión en 7 días o más
     * @returns {Promise<Array>} - Lista de estudiantes inactivos
     */
    async findInactiveStudents() {
        try {
            // Calcular fecha límite (7 días atrás)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            // Formatear fecha para SQL
            const dateLimit = sevenDaysAgo.toISOString().split('T')[0];
            
            // Consultar estudiantes inactivos
            const inactiveStudents = await db.query(`
                SELECT s.id, s.email, s.fullname, s.notification_preferences, sa.last_login 
                FROM students s
                JOIN student_activity sa ON s.id = sa.student_id
                WHERE sa.last_login < ? 
                AND s.status = TRUE
            `, [dateLimit]);
            
            return inactiveStudents;
        } catch (error) {
            console.error('Error al buscar estudiantes inactivos:', error);
            throw error;
        }
    }

    /**
     * Envía recordatorios a los estudiantes inactivos
     * @param {Array} students - Lista de estudiantes inactivos
     * @returns {Promise<Object>} - Resultados del envío
     */
    async sendReminders(students) {
        let sent = 0;
        let skipped = 0;
        
        for (const student of students) {
            try {
                // Verificar preferencias de notificación
                const preferences = student.notification_preferences ? 
                    JSON.parse(student.notification_preferences) : 
                    { emailNotifications: true, reminderFrequency: 'weekly' };
                
                // Si el estudiante ha desactivado las notificaciones, omitir
                if (preferences.emailNotifications === false) {
                    skipped++;
                    continue;
                }
                
                // Calcular días desde último login
                const lastLogin = new Date(student.last_login);
                const today = new Date();
                const daysInactive = DateUtils.getDaysDifference(lastLogin, today);
                
                // Enviar recordatorio
                await emailService.sendReminder(
                    student, 
                    'inactivity',
                    { daysInactive }
                );
                
                sent++;
            } catch (error) {
                console.error(`Error al enviar recordatorio a estudiante ${student.id}:`, error);
                skipped++;
            }
        }
        
        return { sent, skipped };
    }
}

module.exports = new InactivityReminderJob();