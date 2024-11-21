const Student = require('../models/Student');
const userController = require('./userController')

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
                    'Content-Type': 'application/json', // Indica que el cuerpo es JSON
                },
                body: JSON.stringify({
                    to: email,  // Dirección de correo del destinatario (el correo del usuario registrado)
                    subject: "¡Inscripción a curso!", // Asunto del correo
                    text: `Hola ${name},\n\n¡Felicidades! Te has inscrito con éxito en el curso "${courseName}" en MindUp. Estamos muy emocionados de que te unas a nuestra plataforma educativa.
            
                            A continuación, podrás acceder a los materiales del curso y comenzar tu aprendizaje. Estamos aquí para apoyarte en cada paso del camino, por lo que no dudes en ponerte en contacto con nosotros si necesitas alguna asistencia.
            
                            Recuerda que, además del curso, tienes acceso a todas las herramientas que ofrecemos para optimizar tu experiencia. Aprovecha al máximo tu tiempo y aprende con nosotros.
            
                            Si tienes alguna pregunta, puedes ponerte en contacto con nuestro equipo de soporte en cualquier momento.
            
                            ¡Bienvenido a la comunidad MindUp! 
            
                            Saludos,\nEl equipo de MindUp` // Cuerpo del correo con un mensaje de bienvenida personalizado
                }),
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
            const { studentCourseId, moduleId, correctAnswers, totalQuestions } = req.body;
    
            if (!studentCourseId || !moduleId || correctAnswers == null || totalQuestions == null) {
                return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
            }
    
            // Obtener el progreso actual del estudiante
            const studentCourse = await Student.getProgressById(studentCourseId);
    
            if (!studentCourse) {
                return res.status(404).json({ success: false, message: 'El registro del estudiante no existe.' });
            }
    
            // Obtener los módulos del curso
            const courseModules = await Student.getCourseModules(studentCourseId);
            if (!courseModules || courseModules.length === 0) {
                return res.status(404).json({ success: false, message: 'El curso no tiene módulos asignados.' });
            }
    
            // Verificar si el moduleId existe en los módulos del curso
            const moduleExists = courseModules.some(module => module.id === moduleId);
            if (!moduleExists) {
                return res.status(400).json({ success: false, message: 'El módulo especificado no existe en este curso.' });
            }
    
            // Verificar si el progreso es un objeto o una cadena
            const currentProgress = Array.isArray(studentCourse.module_progress)
                ? studentCourse.module_progress
                : JSON.parse(studentCourse.module_progress || '[]'); // Parsear si es una cadena
    
            // Verificar si el módulo ya existe en el progreso
            const moduleIndex = currentProgress.findIndex((m) => m.module_id === moduleId);
    
            if (moduleIndex === -1) {
                // Agregar nuevo módulo
                currentProgress.push({
                    module_id: moduleId,
                    correct_answers: correctAnswers,
                    total_questions: totalQuestions,
                    progress_percentage: (correctAnswers / totalQuestions) * 100,
                });
            } else {
                // Actualizar módulo existente
                currentProgress[moduleIndex] = {
                    ...currentProgress[moduleIndex],
                    correct_answers: correctAnswers,
                    total_questions: totalQuestions,
                    progress_percentage: (correctAnswers / totalQuestions) * 100,
                };
            }
    
            // Guardar progreso actualizado en student_courses
            const updatedProgress = await Student.updateModuleProgress(
                studentCourseId,
                JSON.stringify(currentProgress)
            );
    
            if (!updatedProgress) {
                return res.status(500).json({ success: false, message: 'No se pudo actualizar el progreso del módulo.' });
            }
    
            // Actualizar el porcentaje del curso
            await UserCursesController.updateCourseProgressPercentage(studentCourseId);
    
            return res.status(200).json({
                success: true,
                message: 'Progreso del módulo y del curso actualizado exitosamente.',
                module_progress: currentProgress,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }        

    static async updateCourseProgressPercentage(studentCourseId) {
        try {
            // Obtener el progreso actual del estudiante
            const studentCourse = await Student.getProgressById(studentCourseId);
            if (!studentCourse) {
                return false; // Si el estudiante no existe, no se puede actualizar
            }
    
            // Obtener los módulos del curso al que está inscrito el estudiante
            const courseModules = await Student.getCourseModules(studentCourseId);
    
            // Verificar si existen módulos
            if (courseModules.length === 0) {
                return false; // Si no hay módulos en el curso, no se puede actualizar
            }
    
            // Obtener el progreso del estudiante y calcular el porcentaje total
            const currentProgress = Array.isArray(studentCourse.module_progress)
                ? studentCourse.module_progress
                : JSON.parse(studentCourse.module_progress || '[]');
    
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
    
            // Crear el mapa de progreso y reemplazar el contenido de module_progress
            courses.module_progress = courses.module_progress.reduce((acc, module) => {
                acc[module.module_id] = module.progress_percentage;
                return acc;
            }, {});
    
            // Enviar la respuesta con module_progress reemplazado
            return res.status(200).json({
                success: true,
                message: 'Progresos encontrados.',
                data: courses, // module_progress ahora es un mapa
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