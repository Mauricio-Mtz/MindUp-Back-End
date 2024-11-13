const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

class UserCursesController {
    static async enrollCourse(req, res) {
        const { courseId, studentEmail } = req.body;
    
        try {
            // Llamada al método de inscripción
            const result = await Student.enrollCourse(courseId, studentEmail);
    
            // Enviar respuesta de éxito
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            // Enviar respuesta de error
            return res.status(500).json({
                success: false,
                message: `Ocurrió un error al intentar asignar el curso al estudiante ${studentEmail}.`,
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
}

module.exports = UserCursesController;