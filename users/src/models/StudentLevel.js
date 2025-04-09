const db = require('../../config/db');
const StudentProgress = require('./mongodb/progressSchema');

class StudentLevel {
    static async updateLevelOfStudent(studentCourseId, newLevel) {
        const query = `
            UPDATE student_courses 
            SET level = ? 
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [newLevel, studentCourseId]);
        return result.affectedRows > 0;
    }

    static async getModulesByLevel(courseId, level) {
        // Validación de parámetros
        if (!courseId || !level) {
            console.log('Missing parameters:', { courseId, level });
            return [];
        }

        const query = `
            SELECT * FROM modules 
            WHERE course_id = ? AND level = ?
        `;
        const [modules] = await db.execute(query, [courseId, level]);
        return modules;
    }

    static async getCurrentCourseProgress(studentCourseId) {
        try {
            // Obtener información básica del curso desde MySQL
            const query = `
                SELECT sc.*, c.id as course_id
                FROM student_courses sc
                JOIN courses c ON sc.course_id = c.id
                WHERE sc.id = ?
            `;
            const [basicInfo] = await db.execute(query, [studentCourseId]);
            
            if (basicInfo.length === 0) {
                return null;
            }
            
            // Obtener información detallada del progreso desde MongoDB
            const progressData = await StudentProgress.findOne({ student_course_id: studentCourseId });
            
            // Combinar la información
            return {
                ...basicInfo[0],
                detailedProgress: progressData ? progressData.module_progress : []
            };
        } catch (error) {
            console.error('Error al obtener el progreso del curso:', error);
            throw error;
        }
    }

    // Nuevo método para obtener el progreso específico de un módulo
    static async getModuleProgress(studentCourseId, moduleId) {
        try {
            const progressData = await StudentProgress.findOne({ student_course_id: studentCourseId });
            
            if (!progressData || !progressData.module_progress) {
                return null;
            }
            
            const moduleProgress = progressData.module_progress.find(mp => mp.module_id === moduleId);
            return moduleProgress || null;
        } catch (error) {
            console.error('Error al obtener el progreso del módulo:', error);
            throw error;
        }
    }
    
    // Nuevo método para actualizar el progreso de un módulo específico
    static async updateModuleProgress(studentCourseId, moduleId, correctAnswers, totalQuestions) {
        try {
            // Validate moduleId
            if (!moduleId) {
                console.error('Error: moduleId is undefined or null');
                return false;
            }
            
            console.log('Updating module progress:', { studentCourseId, moduleId, correctAnswers, totalQuestions });
            
            // Calcular el porcentaje de progreso
            const progressPercentage = (correctAnswers / totalQuestions) * 100;
            
            // Buscar si ya existe un documento para este student_course_id
            let progressDoc = await StudentProgress.findOne({ student_course_id: studentCourseId });
            
            if (!progressDoc) {
                // Si no existe, crear un nuevo documento
                progressDoc = new StudentProgress({
                    student_course_id: studentCourseId,
                    module_progress: [{
                        module_id: moduleId,
                        correct_answers: correctAnswers,
                        total_questions: totalQuestions,
                        progress_percentage: progressPercentage
                    }]
                });
            } else {
                // Si existe, verificar si ya tiene un registro para este módulo
                const moduleIndex = progressDoc.module_progress.findIndex(mp => mp.module_id === moduleId);
                
                if (moduleIndex >= 0) {
                    // Actualizar el registro existente
                    progressDoc.module_progress[moduleIndex] = {
                        module_id: moduleId,
                        correct_answers: correctAnswers,
                        total_questions: totalQuestions,
                        progress_percentage: progressPercentage
                    };
                } else {
                    // Agregar un nuevo registro para este módulo
                    progressDoc.module_progress.push({
                        module_id: moduleId,
                        correct_answers: correctAnswers,
                        total_questions: totalQuestions,
                        progress_percentage: progressPercentage
                    });
                }
            }
            
            // Guardar los cambios
            await progressDoc.save();
            
            // Actualizar el progreso general del curso
            await this.updateOverallCourseProgress(studentCourseId);
            
            return true;
        } catch (error) {
            console.error('Error actualizando el progreso del módulo:', error, { studentCourseId, moduleId });
            throw error;
        }
    }
    
    // Método para actualizar el progreso general del curso basado en todos los módulos
    static async updateOverallCourseProgress(studentCourseId) {
        try {
            // Obtener el progreso de todos los módulos
            const progressData = await StudentProgress.findOne({ student_course_id: studentCourseId });
            
            if (!progressData || !progressData.module_progress || progressData.module_progress.length === 0) {
                return false;
            }
            
            // Obtener todos los módulos del curso
            const query = `
                SELECT sc.course_id, COUNT(m.id) as total_modules
                FROM student_courses sc
                JOIN modules m ON m.course_id = sc.course_id
                WHERE sc.id = ?
                GROUP BY sc.course_id
            `;
            const [courseInfo] = await db.execute(query, [studentCourseId]);
            
            if (courseInfo.length === 0) {
                return false;
            }
            
            const totalModules = courseInfo[0].total_modules;
            const completedModulesCount = progressData.module_progress.filter(mp => mp.progress_percentage >= 70).length;
            
            // Calcular el porcentaje general de progreso
            const overallProgress = (completedModulesCount / totalModules) * 100;
            
            // Actualizar el progreso en la base de datos relacional
            const updateQuery = `UPDATE student_courses SET progress = ? WHERE id = ?`;
            await db.execute(updateQuery, [overallProgress, studentCourseId]);
            
            return true;
        } catch (error) {
            console.error('Error actualizando el progreso general del curso:', error);
            throw error;
        }
    }
}

module.exports = StudentLevel;