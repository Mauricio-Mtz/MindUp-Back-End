const Course = require('../models/Course');
const Module = require('../models/Module');
const ContentService = require("../services/contentService");

class ContentController {
    static async getAllCourses(req, res) {
        try {
            const courses = await Course.getAllCourses();
            if (courses.length === 0){
                res.status(200).json({
                    success: true,
                    message: "No hay cursos."
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Cursos obtenidos correctamente.",
                    data: courses
                });
            }
        } catch (error) {
            console.error('Error al obtener los cursos:', error.message);
            res.status(500).json({ message: 'Error al obtener los cursos', error });
        }
    }

    static async getRecomendedCourses(req, res) {
        try {
            const courses = await Course.getAllCourses();
            if (courses.length === 0){
                res.status(200).json({
                    success: true,
                    message: "No hay cursos."
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Cursos obtenidos correctamente.",
                    data: courses
                });
            }
        } catch (error) {
            console.error('Error al obtener los cursos:', error.message);
            res.status(500).json({ message: 'Error al obtener los cursos', error });
        }
    }

    static async getCourse(req, res) {
        const { id } = req.params;
        try {
            // Obtener el curso
            const course = await Course.getCourse(id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Curso no encontrado."
                });
            }
    
            // Obtener los modulos del curso
            const modules = await Module.getModuleDetail(id);
    
            // Unir el curso y los módulos en un solo JSON
            const courseWithModules = {
                ...course,
                modules: modules
            };
    
            // Enviar la respuesta con el JSON combinado
            res.status(200).json({
                success: true,
                message: "Curso obtenido correctamente.",
                data: courseWithModules
            });
        } catch (error) {
            console.error('Error al obtener el curso:', error.message);
            res.status(500).json({ message: 'Error al obtener el curso', error });
        }
    }

    static async getCatalog(req, res) {
        try {
            const { email } = req.query;
    
            // Obtener las preferencias del estudiante
            const response = await fetch(`http://localhost:3000/users/getUser?email=${email}`, {
                method: 'GET'
            });
            const studentResponse = await response.json();
            const student = studentResponse.data;
    
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }
    
            // Vector de preferencias del estudiante
            const preferences = student.preferences;
    
            // Obtener todos los cursos
            const allCourses = await Course.getAllCourses();
    
            // Filtrar cursos basados en las preferencias
            const matchingCourses = allCourses.filter(course => {
                const courseCategories = course.category;
                return preferences.some(pref => courseCategories.includes(pref));
            });
    
            if (matchingCourses.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No hay cursos que coincidan con las preferencias del estudiante.',
                    data: []
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Cursos obtenidos correctamente según las preferencias del estudiante.',
                    data: matchingCourses
                });
            }
        } catch (error) {
            console.error('Error al obtener el catálogo de cursos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el catálogo de cursos',
                error: error.message
            });
        }
    }

    static async getCategories(req, res) {
        try {
            const categories = await Course.getCategories();
    
            if (categories.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No hay categorias.',
                    data: []
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Categorias obtenidas correctamente.',
                    data: categories  // Ahora es un array simple de nombres de categorías
                });
            }
        } catch (error) {
            console.error('Error al obtener las categorias:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las categorias',
                error: error.message
            });
        }
    }

    static async getModuleDetail(req, res) {
        const { id } = req.params;
        try {
            const moduleDetail = await Module.getModuleDetail(id);
            console.log(moduleDetail)
            if (!moduleDetail) {
                return res.status(404).json({
                    success: false,
                    message: "Modulo no encontrado."
                });
            }
            // Enviar la respuesta con el JSON combinado
            res.status(200).json({
                success: true,
                message: "Modulo obtenido correctamente.",
                data: moduleDetail
            });
        } catch (error) {
            console.error('Error al obtener el curso: ', error.message);
            res.status(500).json({ message: 'Error al obtener el detalle del modulo: ', error });
        }
    }
    static async getModuleDetailCatalog(req, res) {
        const { id } = req.params;
        try {
            const moduleDetail = await Module.getModuleDetailCatalog(id);
            console.log(moduleDetail)
            if (!moduleDetail) {
                return res.status(404).json({
                    success: false,
                    message: "Modulo no encontrado."
                });
            }
            // Enviar la respuesta con el JSON combinado
            res.status(200).json({
                success: true,
                message: "Modulo obtenido correctamente.",
                data: moduleDetail
            });
        } catch (error) {
            console.error('Error al obtener el curso: ', error.message);
            res.status(500).json({ message: 'Error al obtener el detalle del modulo: ', error });
        }
    }
    
    static async getCoursesByOrganization(req, res) {
        const { id } = req.params;
        try {
            const courses = await Course.getCoursesByOrganization(id);
            if (courses.length === 0){
                res.status(200).json({
                    success: true,
                    message: "No hay cursos."
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Cursos obtenidos correctamente.",
                    data: courses
                });
            }
        } catch (error) {
            console.error('Error al obtener los cursos:', error.message);
            res.status(500).json({ message: 'Error al obtener los cursos', error });
        }
    }

    // Middleware para manejar la subida de imágenes
    static uploadMiddleware = ContentService.upload(); // Usamos el middleware de multer configurado

    // Método para agregar un nuevo curso
    static async addNewCourse(req, res) {
        try {
            // Llamar al middleware de multer para manejar la subida de imagen
            ContentController.uploadMiddleware(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({ error: "Error al subir la imagen." });
                }

                // Obtener los datos enviados por el cliente
                const { name, description, organization_id, category } = req.body;

                // Verificar si req.file está definido
                if (!req.file) {
                    return res.status(400).json({ error: "No se ha subido ninguna imagen." });
                }

                // Subir la imagen al servidor remoto
                const remoteImagePath = await ContentService.uploadToRemoteServer(req.file);

                // Insertar el curso en la base de datos utilizando el modelo
                const newCourse = await Course.createCourse({
                    name,
                    description,
                    img: remoteImagePath.split('/').pop(), // Guardamos solo el nombre del archivo
                    organization_id,
                    category,
                });

                // Respuesta exitosa al cliente
                res.status(201).json({ message: "Curso creado exitosamente.", course: newCourse });
            });
        } catch (error) {
            console.error("Error al crear el curso:", error);
            res.status(500).json({ error: "Error interno del servidor." });
        }
    }

    static async addNewContent(req, res) {
        const { content, id, courseId } = req.body;

        if (!id && !courseId) {
            return res.status(400).json({ message: 'Ids no encontradas' });
        }

        try {
            const affectedRows = await Module.addNewContent(content,id,courseId);
            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false, 
                    message: 'Curso no encontrado',
                    rows: 0 
                });
            }
            res.status(200).json({
                success: true,
                message: "Contenido agregado correctamente.",
                rows: affectedRows 
            });
            
        } catch (error) {
            console.error('Error al actualizar el curso:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error del servidor',
                rows: -1 
            });
        }
    }

    static async addNewQuestion(req, res) {
        const { quiz, id, courseId } = req.body;

        if (!id && !courseId) {
            return res.status(400).json({ message: 'Ids no encontradas' });
        }

        try {
            const affectedRows = await Module.addNewQuestion(quiz,id,courseId);
            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false, 
                    message: 'Curso no encontrado',
                    rows: 0 
                });
            }
            res.status(200).json({
                success: true,
                message: "Contenido agregado correctamente.",
                rows: affectedRows 
            });
            
        } catch (error) {
            console.error('Error al actualizar el curso:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error del servidor',
                rows: -1 
            });
        }
    }

    static async addNewModule(req, res) {
        const { name, level, courseId } = req.body;

        if ( !courseId) {
            return res.status(400).json({ message: 'Id no encontrada' });
        }

        try {
            const affectedRows = await Module.addNewModule(name, level, courseId);
            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false, 
                    message: 'Curso no encontrado',
                    rows: 0 
                });
            }
            res.status(200).json({
                success: true,
                message: "Contenido agregado correctamente.",
                rows: affectedRows 
            });
            
        } catch (error) {
            console.error('Error al actualizar el curso:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error del servidor',
                rows: -1 
            });
        }
    }

    static async desactiveCourse(req, res) {
        const { id } = req.body;

        try {
            const affectedRows = await Course.toggleCourseStatus(id);
            if (affectedRows === 0) {
                return res.status(200).json({ success: false, message: 'Curso no encontrado' });
            }
            res.json({ success: true, message: 'Curso eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el curso:', error.message);
            res.status(500).json({ message: 'Error al eliminar el curso', error });
        }
    }
}

module.exports = ContentController;
