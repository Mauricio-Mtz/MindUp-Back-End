const cron = require('node-cron');
const inactivityReminderJob = require('./jobs/inactivityReminderJob');
const courseProgressReminderJob = require('./jobs/courseProgressReminderJob');
const subscriptionReminderJob = require('./jobs/subscriptionReminderJob');

/**
 * Servicio de programación para trabajos automáticos
 */
class Scheduler {
    constructor() {
        this.jobs = [];
    }

    /**
     * Inicializa los trabajos programados
     */
    initScheduler() {
        console.log('Inicializando el planificador de tareas...');
        
        // Programar recordatorio de inactividad diariamente a las 10:00 AM
        this.scheduleJob('0 10 * * *', inactivityReminderJob.execute, 'Recordatorio de inactividad');

        // Programar recordatorio de progreso de curso tres veces por semana (lunes, miércoles, viernes) a las 3:00 PM
        this.scheduleJob('0 15 * * 1,3,5', courseProgressReminderJob.execute, 'Recordatorio de progreso en cursos');

        // Programar recordatorio de suscripción diariamente a las 9:00 AM
        this.scheduleJob('0 9 * * *', subscriptionReminderJob.execute, 'Recordatorio de suscripción');

        console.log(`${this.jobs.length} trabajos programados iniciados.`);
    }

    /**
     * Programa un trabajo con cron
     * @param {string} schedule - Expresión cron para la programación
     * @param {Function} jobFunction - Función a ejecutar
     * @param {string} jobName - Nombre del trabajo
     */
    scheduleJob(schedule, jobFunction, jobName) {
        try {
            // Validar que la expresión cron sea válida
            if (!cron.validate(schedule)) {
                throw new Error(`Expresión cron inválida: ${schedule}`);
            }

            // Programa el trabajo
            const job = cron.schedule(schedule, async () => {
                console.log(`Ejecutando trabajo: ${jobName} - ${new Date().toISOString()}`);
                try {
                    await jobFunction();
                    console.log(`Trabajo completado: ${jobName} - ${new Date().toISOString()}`);
                } catch (error) {
                    console.error(`Error al ejecutar trabajo ${jobName}:`, error);
                }
            });

            // Inicia el trabajo
            job.start();

            // Guarda referencia al trabajo
            this.jobs.push({
                name: jobName,
                schedule,
                job
            });

            console.log(`Trabajo programado: ${jobName} - ${schedule}`);
        } catch (error) {
            console.error(`Error al programar trabajo ${jobName}:`, error);
        }
    }

    /**
     * Detiene todos los trabajos programados
     */
    stopAllJobs() {
        this.jobs.forEach(job => {
            job.job.stop();
            console.log(`Trabajo detenido: ${job.name}`);
        });
    }
}

module.exports = new Scheduler();