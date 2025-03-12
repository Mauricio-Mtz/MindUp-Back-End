const Student = require('../models/Student');
const userController = require('./userController')
const LevelSystemController = require('./LevelSystemController');

class UserCursesController {
    static async enrollCourse(req, res) {
        const { courseId, studentEmail } = req.body;
    
        try {
            // Llamar al método del modelo
            const result = await Student.enrollCourse(courseId, studentEmail);
    
            // Verificar si el modelo retornó un error manejado
            if (!result.success) {
                return res.status(200).json({
                    success: false,
                    message: result.message,
                });
            }
    
            // Enviar correo de bienvenida
            const { name, email } = result.student;
            const courseName = result.course.name;
    
            await fetch('http://localhost:3000/notifications/createNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject: "¡Inscripción a curso!",
                    type: "courseEnrollment",
                    data: {
                        name: name,
                        courseName: courseName
                    }
                })
            });     
    
            // Respuesta de éxito
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            // Respuesta de error no manejado
            return res.status(500).json({
                success: false,
                message: 'Error inesperado al inscribir al estudiante en el curso.',
                error: error.message,
            });
        }
    }    

    static async getCoursesByStudent(req, res) {
        const { email } = req.query;
        try {
            
            const courses = await Student.getCoursesByStudent(email);

            if (!courses) {
                return res.status(200).json({
                    success: false,
                    message: 'Cursos no encontrados.',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Cursos encontrados.',
                data: courses,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Búsqueda de cursos fallida.',
                error: error.message,
            });
        }
    }
    
    static async registerQuizzResult(req, res) {
        try {
            const { studentCourseId, moduleId, correctAnswers, totalQuestions, completionTime } = req.body;
    
            if (!studentCourseId || !moduleId || correctAnswers == null || totalQuestions == null) {
                return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
            }
    
            // Obtener los módulos del curso primero
            const courseModules = await Student.getCourseModules(studentCourseId);
            if (!courseModules || courseModules.length === 0) {
                return res.status(404).json({ success: false, message: 'El curso no tiene módulos asignados.' });
            }
    
            // Verificar si el moduleId existe en los módulos del curso
            const moduleExists = courseModules.some(module => module.id === moduleId);
            if (!moduleExists) {
                return res.status(400).json({ success: false, message: 'El módulo especificado no existe en este curso.' });
            }
    
            // Obtener el progreso actual del estudiante
            let studentCourse = await Student.getProgressById(studentCourseId);
            
            // Inicializar un array vacío si no hay registro de progreso
            let currentProgress = [];
            
            if (studentCourse && studentCourse.module_progress) {
                // Si existe progreso, usarlo
                currentProgress = Array.isArray(studentCourse.module_progress) 
                    ? studentCourse.module_progress 
                    : JSON.parse(studentCourse.module_progress || '[]');
            }
    
            // Verificar si el módulo ya existe en el progreso
            const moduleIndex = currentProgress.findIndex((m) => m.module_id === moduleId);
            
            const progressPercentage = (correctAnswers / totalQuestions) * 100;
    
            if (moduleIndex === -1) {
                // Agregar nuevo módulo con intentos inicializados
                currentProgress.push({
                    module_id: moduleId,
                    completionTime: completionTime,
                    correct_answers: correctAnswers,
                    total_questions: totalQuestions,
                    progress_percentage: progressPercentage,
                    attempts: 1, // Primer intento
                });
            } else {
                // Actualizar módulo existente e incrementar intentos
                currentProgress[moduleIndex] = {
                    ...currentProgress[moduleIndex],
                    completionTime: completionTime,
                    correct_answers: correctAnswers,
                    total_questions: totalQuestions,
                    progress_percentage: progressPercentage,
                    attempts: (currentProgress[moduleIndex].attempts || 0) + 1, // Incrementar intentos
                };
            }
    
            // Ordenar el arreglo currentProgress por module_id antes de guardar
            currentProgress.sort((a, b) => a.module_id - b.module_id);
    
            // Guardar progreso actualizado en MongoDB (usando el nuevo método)
            const updatedProgress = await Student.updateModuleProgress(
                studentCourseId,
                currentProgress
            );
    
            if (!updatedProgress) {
                return res.status(500).json({ success: false, message: 'No se pudo actualizar el progreso del módulo.' });
            }
    
            // Actualizar el porcentaje del curso
            await UserCursesController.updateCourseProgressPercentage(studentCourseId);
    
            // Después de actualizar el progreso del módulo
            const moduleData = {
                correct_answers: correctAnswers,
                total_questions: totalQuestions,
                completionTime: completionTime,
                attempts: currentProgress.find(m => m.module_id === moduleId)?.attempts || 1,
                level: courseModules.find(m => m.id === moduleId)?.level || 1
            };
    
            // Procesar el resultado del quiz para el sistema de niveles
            const levelResults = await LevelSystemController.processQuizResult(
                moduleData,
                studentCourseId // Pasamos solo el ID, y obtenemos los datos completos en el controlador
            );
    
            return res.status(200).json({
                success: true,
                message: 'Progreso actualizado exitosamente.',
                module_progress: currentProgress,
                level_results: levelResults
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }  

    static async updateCourseProgressPercentage(studentCourseId) {
        try {
            // Obtener los módulos del curso al que está inscrito el estudiante
            const courseModules = await Student.getCourseModules(studentCourseId);
    
            // Verificar si existen módulos
            if (courseModules.length === 0) {
                return false; // Si no hay módulos en el curso, no se puede actualizar
            }
    
            // Obtener el progreso actual del estudiante
            const studentProgress = await Student.getProgressById(studentCourseId);
            
            // Si no hay progreso registrado, inicializar en 0%
            if (!studentProgress || !studentProgress.module_progress) {
                await Student.updateCourseProgress(studentCourseId, 0);
                return true;
            }
    
            // Obtener el progreso del estudiante
            const currentProgress = Array.isArray(studentProgress.module_progress)
                ? studentProgress.module_progress
                : JSON.parse(studentProgress.module_progress || '[]');
    
            let totalProgress = 0;
            const totalModules = courseModules.length;
    
            // Sumar el porcentaje de cada módulo completado
            courseModules.forEach(module => {
                const moduleInProgress = currentProgress.find(m => m.module_id === module.id);
                totalProgress += moduleInProgress ? moduleInProgress.progress_percentage : 0;
            });
    
            // Calcular el porcentaje total del curso
            const courseProgressPercentage = totalModules > 0 ? (totalProgress / totalModules) : 0;
    
            // Actualizar el porcentaje de completado del curso
            const updated = await Student.updateCourseProgress(studentCourseId, courseProgressPercentage);
            return updated;
    
        } catch (error) {
            console.error(error);
            return false;
        }
    }    

    static async getStudentProgress(req, res) {
        const { userEmail, courseId } = req.body;
        try {
            // Obtener datos del usuario
            const userData = await userController.findUserByEmail(userEmail);
            const courses = await Student.getStudentProgress(userData.user.id, courseId);
    
            if (!courses) {
                return res.status(200).json({
                    success: false,
                    message: 'El usuario no tiene ningún curso asignado.',
                });
            }
    
            // Validar si module_progress es null o un arreglo vacío
            if (!Array.isArray(courses.module_progress) || courses.module_progress.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'El ususario no tiene progresos aún.',
                    data: courses,
                });
            }
    
            // Crear el mapa de progreso y reemplazar el contenido de module_progress
            courses.module_progress = courses.module_progress.reduce((acc, module) => {
                acc[module.module_id] = module.progress_percentage;
                return acc;
            }, {});
    
            // Enviar la respuesta con module_progress reemplazado
            return res.status(200).json({
                success: true,
                message: 'Progresos encontrados.',
                data: courses,
            });
    
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Búsqueda de progresos fallida.',
                error: error.message,
            });
        }
    }    
}

module.exports = UserCursesController;