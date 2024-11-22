import pool from './../../config/db.js';

class StatisticsModel {
    async getTotalStudents(organizationId) {
        const [result] = await pool.query(
            'SELECT COUNT(*) as total FROM students s JOIN student_courses sc ON s.id = sc.student_id WHERE sc.course_id IN (SELECT id FROM courses WHERE organization_id = ?)',
            [organizationId]
        );
        return result[0].total;
    }

    async getStudentGeographicDistribution(organizationId) {
        const [result] = await pool.query(
            'SELECT country, COUNT(*) as count FROM students s JOIN student_courses sc ON s.id = sc.student_id WHERE sc.course_id IN (SELECT id FROM courses WHERE organization_id = ?) GROUP BY country',
            [organizationId]
        );
        return result;
    }

    async getAverageStudentProgress(organizationId) {
        const [result] = await pool.query(
            `SELECT 
                AVG(sc.progress) as average_progress, 
                c.name as course_name 
            FROM student_courses sc
            JOIN courses c ON sc.course_id = c.id
            WHERE c.organization_id = ?
            GROUP BY c.id`,
            [organizationId]
        );
        return result;
    }

    async getSubscriptionStatistics(organizationId) {
        const [activeSubscriptions] = await pool.query(
            `SELECT COUNT(*) as active_subscriptions 
            FROM subscriptions s
            JOIN students st ON s.student_id = st.id
            JOIN student_courses sc ON st.id = sc.student_id
            JOIN courses c ON sc.course_id = c.id
            WHERE c.organization_id = ? AND s.status = 'active'`,
            [organizationId]
        );

        const [subscriptionRevenue] = await pool.query(
            `SELECT SUM(p.amount) as total_revenue
            FROM payments p
            JOIN subscriptions s ON p.subscription_id = s.id
            JOIN students st ON s.student_id = st.id
            JOIN student_courses sc ON st.id = sc.student_id
            JOIN courses c ON sc.course_id = c.id
            WHERE c.organization_id = ? AND p.status = 'completed'`,
            [organizationId]
        );

        return {
            activeSubscriptions: activeSubscriptions[0].active_subscriptions,
            totalRevenue: subscriptionRevenue[0].total_revenue
        };
    }
    
    async getStudentProgressByOrganization(organizationId) {
        // Primero obtenemos el total de módulos por curso
        const [coursesModules] = await pool.query(`
            SELECT 
                course_id,
                COUNT(id) as total_modules
            FROM 
                modules
            GROUP BY 
                course_id
        `);
    
        // Crear un mapa para acceso rápido al total de módulos por curso
        const modulesByCourse = coursesModules.reduce((acc, course) => {
            acc[course.course_id] = course.total_modules;
            return acc;
        }, {});
    
        // Obtener datos de estudiantes y sus progresos
        const [results] = await pool.query(`
            SELECT 
                s.id as studentId,
                s.fullname,
                c.id as courseId,
                c.name as courseName,
                sc.module_progress,
                sc.progress as courseProgress
            FROM 
                students s
            JOIN 
                student_courses sc ON s.id = sc.student_id
            JOIN 
                courses c ON sc.course_id = c.id
            WHERE 
                c.organization_id = ?
        `, [organizationId]);
    
        // Procesar los resultados por estudiante y curso
        const processedResults = results.map(student => {
            // Manejo seguro de module_progress
            let moduleProgress = [];
            try {
                if (student.module_progress) {
                    moduleProgress = JSON.parse(student.module_progress);
                    // Asegurarse de que sea un array
                    moduleProgress = Array.isArray(moduleProgress) ? moduleProgress : [];
                }
            } catch (error) {
                console.error(`Error parsing module_progress for student ${student.studentId}:`, error);
                moduleProgress = [];
            }
    
            // Corrección: modulesUsed ahora cuenta cualquier módulo que tenga un progress_percentage,
            // incluso si no está completado
            const modulesUsed = moduleProgress.filter(module => 
                module && 
                typeof module === 'object' && 
                'progress_percentage' in module
            ).length;
    
            // Corrección: quizzesPassed ahora cuenta correctamente los módulos con 100% de progreso
            const quizzesPassed = moduleProgress.filter(module => 
                module && 
                typeof module === 'object' && 
                'progress_percentage' in module && 
                parseFloat(module.progress_percentage) === 100
            ).length;
    
            const totalModules = modulesByCourse[student.courseId] || 0;
            const overallProgress = student.courseProgress || 0;
    
            return {
                studentId: student.studentId,
                courseId: student.courseId,
                courseName: student.courseName,
                regressionData: {
                    modulesUsed,
                    quizzesPassed,
                    totalModules,
                    overallProgress
                },
                details: {
                    fullname: student.fullname,
                    moduleProgress: moduleProgress,
                    moduleAnalysis: {
                        modulesInProgress: modulesUsed,
                        completedModules: quizzesPassed,
                        remainingModules: totalModules - modulesUsed,
                        progressPercentage: overallProgress
                    }
                }
            };
        });
    
        // Agrupar por estudiante para análisis global
        const studentAnalysis = processedResults.reduce((acc, result) => {
            if (!acc[result.studentId]) {
                acc[result.studentId] = {
                    studentId: result.studentId,
                    fullname: result.details.fullname,
                    courses: []
                };
            }
            acc[result.studentId].courses.push({
                courseId: result.courseId,
                courseName: result.courseName,
                regressionData: result.regressionData,
                details: result.details
            });
            return acc;
        }, {});
    
        return {
            regressionData: processedResults.map(result => ({
                studentId: result.studentId,
                courseId: result.courseId,
                ...result.regressionData
            })),
            studentAnalysis: Object.values(studentAnalysis)
        };
    }
}

export default new StatisticsModel();