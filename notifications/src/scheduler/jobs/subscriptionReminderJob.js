const db = require('../../utils/dbUtils');
const emailService = require('../../services/emailService');
const DateUtils = require('../../utils/dateUtils');

/**
 * Trabajo para enviar recordatorios de suscripción
 */
class SubscriptionReminderJob {
    /**
     * Ejecuta el trabajo de recordatorios de suscripción
     */
    async execute() {
        try {
            console.log('Iniciando trabajo de recordatorios de suscripción...');

            // Buscar suscripciones por expirar
            const expiringSoon = await this.findExpiringSubscriptions();
            console.log(`Se encontraron ${expiringSoon.length} suscripciones por expirar.`);

            // Buscar suscripciones recién expiradas
            const recentlyExpired = await this.findRecentlyExpiredSubscriptions();
            console.log(`Se encontraron ${recentlyExpired.length} suscripciones recién expiradas.`);

            // Enviar recordatorios para suscripciones por expirar
            const resultsSoon = await this.sendReminders(expiringSoon, false);
            console.log(`Recordatorios de suscripciones por expirar enviados: ${resultsSoon.sent}`);
            console.log(`Recordatorios de suscripciones por expirar omitidos: ${resultsSoon.skipped}`);

            // Enviar recordatorios para suscripciones expiradas
            const resultsExpired = await this.sendReminders(recentlyExpired, true);
            console.log(`Notificaciones de suscripciones expiradas enviadas: ${resultsExpired.sent}`);
            console.log(`Notificaciones de suscripciones expiradas omitidas: ${resultsExpired.skipped}`);

            return {
                success: true,
                expiringSoon: {
                    sent: resultsSoon.sent,
                    skipped: resultsSoon.skipped
                },
                expired: {
                    sent: resultsExpired.sent,
                    skipped: resultsExpired.skipped
                }
            };
        } catch (error) {
            console.error('Error al ejecutar trabajo de recordatorios de suscripción:', error);
            throw error;
        }
    }

    /**
     * Encuentra suscripciones que expirarán pronto (en los próximos 7 días)
     * @returns {Promise<Array>} - Lista de suscripciones por expirar
     */
    async findExpiringSubscriptions() {
        try {
            // Calcular rangos de fechas para recordatorios (1, 3 y 7 días antes de expirar)
            const today = new Date();
            const inOneDay = DateUtils.addDays(today, 1).toISOString().split('T')[0];
            const inThreeDays = DateUtils.addDays(today, 3).toISOString().split('T')[0];
            const inSevenDays = DateUtils.addDays(today, 7).toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];

            // Consultar suscripciones por expirar
            const expiringSubs = await db.query(`
                SELECT 
                    s.id AS subscription_id,
                    s.end_date,
                    st.id AS student_id,
                    st.email,
                    st.fullname,
                    st.notification_preferences
                FROM subscriptions s
                JOIN students st ON s.student_id = st.id
                WHERE s.status = 'active'
                AND s.end_date BETWEEN ? AND ?
                AND st.status = TRUE
            `, [todayStr, inSevenDays]);

            // Agregar días restantes a cada suscripción
            return expiringSubs.map(sub => {
                const endDate = new Date(sub.end_date);
                const daysRemaining = DateUtils.getDaysDifference(today, endDate);
                return {
                    ...sub,
                    daysRemaining,
                    expirationDate: DateUtils.formatDate(endDate)
                };
            });
        } catch (error) {
            console.error('Error al buscar suscripciones por expirar:', error);
            throw error;
        }
    }

    /**
     * Encuentra suscripciones que expiraron recientemente (en el último día)
     * @returns {Promise<Array>} - Lista de suscripciones recién expiradas
     */
    async findRecentlyExpiredSubscriptions() {
        try {
            // Calcular fecha de ayer
            const yesterday = DateUtils.addDays(new Date(), -1).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];

            // Consultar suscripciones recién expiradas
            const expiredSubs = await db.query(`
                SELECT 
                    s.id AS subscription_id,
                    s.end_date,
                    st.id AS student_id,
                    st.email,
                    st.fullname,
                    st.notification_preferences
                FROM subscriptions s
                JOIN students st ON s.student_id = st.id
                WHERE s.status = 'expired'
                AND s.end_date BETWEEN ? AND ?
                AND st.status = TRUE
            `, [yesterday, today]);

            // Formatear fecha de expiración
            return expiredSubs.map(sub => {
                return {
                    ...sub,
                    daysRemaining: 0,
                    expirationDate: DateUtils.formatDate(sub.end_date)
                };
            });
        } catch (error) {
            console.error('Error al buscar suscripciones expiradas:', error);
            throw error;
        }
    }

    /**
     * Envía recordatorios de suscripción
     * @param {Array} subscriptions - Lista de suscripciones
     * @param {boolean} isExpired - Indica si las suscripciones ya expiraron
     * @returns {Promise<Object>} - Resultados del envío
     */
    async sendReminders(subscriptions, isExpired) {
        let sent = 0;
        let skipped = 0;

        for (const sub of subscriptions) {
            try {
                // Verificar preferencias de notificación
                const preferences = sub.notification_preferences ? 
                    JSON.parse(sub.notification_preferences) : 
                    { emailNotifications: true };

                // Si el estudiante ha desactivado las notificaciones, omitir
                if (preferences.emailNotifications === false) {
                    skipped++;
                    continue;
                }

                // Datos para el correo
                const reminderData = {
                    expirationDate: sub.expirationDate,
                    daysRemaining: sub.daysRemaining,
                    status: isExpired ? 'expired' : 'active'
                };

                // Enviar recordatorio
                await emailService.sendReminder(
                    {
                        id: sub.student_id,
                        email: sub.email,
                        fullname: sub.fullname
                    },
                    'subscription',
                    reminderData
                );

                sent++;
            } catch (error) {
                console.error(`Error al enviar recordatorio de suscripción a estudiante ${sub.student_id}:`, error);
                skipped++;
            }
        }

        return { sent, skipped };
    }
}

module.exports = new SubscriptionReminderJob();