const Student = require('../models/Student');

class UserCursesController {
    static async enrollCourse(req, res) {
        const { courseId, studentEmail } = req.body;
    
        try {
            // Llamada al método de inscripción
            const result = await Student.enrollCourse(courseId, studentEmail);
            
            // Obtener el nombre del curso y el correo del estudiante (deberías tener esta información)
            const courseName = result.course.name;  // Nombre del curso
            const { name, email } = result.student; // Asumiendo que el resultado de enrollCourse devuelve también los datos del estudiante

            // Enviar correo de bienvenida con detalles sobre el curso
            await fetch('http://localhost:3000/notifications/createNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que el cuerpo es JSON
                },
                body: JSON.stringify({
                    to: email,  // Dirección de correo del destinatario (el correo del usuario registrado)
                    subject: "¡Bienvenido a MindUp!", // Asunto del correo
                    text: `Hola ${name},\n\n¡Felicidades! Te has inscrito con éxito en el curso "${courseName}" en MindUp. Estamos muy emocionados de que te unas a nuestra plataforma educativa.
            
                            A continuación, podrás acceder a los materiales del curso y comenzar tu aprendizaje. Estamos aquí para apoyarte en cada paso del camino, por lo que no dudes en ponerte en contacto con nosotros si necesitas alguna asistencia.
            
                            Recuerda que, además del curso, tienes acceso a todas las herramientas que ofrecemos para optimizar tu experiencia. Aprovecha al máximo tu tiempo y aprende con nosotros.
            
                            Si tienes alguna pregunta, puedes ponerte en contacto con nuestro equipo de soporte en cualquier momento.
            
                            ¡Bienvenido a la comunidad MindUp! 
            
                            Saludos,\nEl equipo de MindUp` // Cuerpo del correo con un mensaje de bienvenida personalizado
                }),
            });                 
    
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