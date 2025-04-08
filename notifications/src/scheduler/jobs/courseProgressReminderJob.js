const db = require('../../utils/dbUtils');
const emailService = require('../../services/emailService');
const DateUtils = require('../../utils/dateUtils');

/**
 * Trabajo para enviar recordatorios de progreso en cursos
 */
class CourseProgressReminderJob {
    /**
     * Ejecuta el trabajo de recordatorios de progreso
     */
    async execute() {
        try {
            console.log('Iniciando trabajo de recordatorios de progreso en cursos...');
            
            // Buscar estudiantes con progreso estancado
            const stagnantStudents = await this.findStagnantProgress();
            console.log(`Se encontraron ${stagnantStudents.length} estudiantes con progreso estancado.`);
            
            // Enviar recordatorios
            const results = await this.sendReminders(stagnantStudents);
            
            console.log(`Recordatorios de progreso enviados: ${results.sent}`);
            console.log(`Recordatorios de progreso omitidos: ${results.skipped}`);
            
            return {
                success: true,
                sent: results.sent,
                skipped: results.skipped
            };
        } catch (error) {
            console.error('Error al ejecutar trabajo de recordatorios de progreso:', error);
            throw error;
        }
    }

    /**
     * Encuentra estudiantes con progreso estancado en cursos
     * @returns {Promise<Array>} - Lista de estudiantes con progreso estancado
     */
    async findStagnantProgress() {
        try {
            // Calcular fecha límite (5 días atrás)
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            
            // Formatear fecha para SQL
            const dateLimit = fiveDaysAgo.toISOString().split('T')[0];
            
            // Consultar estudiantes con acceso a cursos pero sin completar módulos recientemente
            const stagnantStudents = await db.query(`
                SELECT 
                    s.id, 
                    s.email, 
                    s.fullname, 
                    s.notification_preferences,
                    c.id AS courseId,
                    c.name AS courseName,
                    sc.progress,
                    sa.last_course_access,
                    sa.last_module_completed
                FROM students s
                JOIN student_activity sa ON s.id = sa.student_id
                JOIN student_courses sc ON s.id = sc.student_id
                JOIN courses c ON sc.course_id = c.id
                WHERE sa.last_course_access > sa.last_module_completed
                AND sa.last_module_completed < ?
                AND sc.progress < 1.0
                AND s.status = TRUE
                ORDER BY s.id, sc.progress DESC
            `, [dateLimit]);
            
            // Agrupar resultados por estudiante (tomando el curso con mayor progreso)
            const groupedStudents = [];
            const processedStudents = new Set();
            
            for (const student of stagnantStudents) {
                if (!processedStudents.has(student.id)) {
                    groupedStudents.push(student);
                    processedStudents.add(student.id);
                }
            }
            
            return groupedStudents;
        } catch (error) {
            console.error('Error al buscar estudiantes con progreso estancado:', error);
            throw error;
        }
    }

    /**
     * Envía recordatorios a los estudiantes con progreso estancado
     * @param {Array} students - Lista de estudiantes
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
                
                // Convertir progreso a porcentaje
                const progressPercent = Math.round(student.progress * 100);
                
                // Enviar recordatorio
                await emailService.sendReminder(
                    student, 
                    'courseProgress',
                    { 
                        courseName: student.courseName,
                        courseId: student.courseId,
                        progress: progressPercent
                    }
                );
                
                sent++;
            } catch (error) {
                console.error(`Error al enviar recordatorio de progreso a estudiante ${student.id}:`, error);
                skipped++;
            }
        }
        
        return { sent, skipped };
    }
}

module.exports = new CourseProgressReminderJob();