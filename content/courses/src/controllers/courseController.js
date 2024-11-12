// controllers/CourseController.js
const axios = require('axios');
const Course = require('../models/Course');

class CourseController {
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

    static async createCourse(req, res) {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
        }

        try {
            const newCourse = await Course.createCourse(name, description);
            res.status(201).json(newCourse);
        } catch (error) {
            console.error('Error al crear el curso:', error.message);
            res.status(500).json({ message: 'Error al crear el curso', error });
        }
    }

    static async updateCourse(req, res) {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
        }

        try {
            const affectedRows = await Course.updateCourse(id, name, description);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Curso no encontrado' });
            }
            res.json({ id, name, description });
        } catch (error) {
            console.error('Error al actualizar el curso:', error.message);
            res.status(500).json({ message: 'Error al actualizar el curso', error });
        }
    }

    static async deleteCourse(req, res) {
        const { id } = req.params;

        try {
            const affectedRows = await Course.deleteCourse(id);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Curso no encontrado' });
            }
            res.json({ message: 'Curso eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el curso:', error.message);
            res.status(500).json({ message: 'Error al eliminar el curso', error });
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
    
            // Hacer solicitud a otro microservicio para obtener los módulos del curso con Axios
            const response = await axios.get(`http://localhost:3003/getModulesForCourses/${id}`);
            const modules = response.data;
    
            // Unir el curso y los módulos en un solo JSON
            const courseWithModules = {
                ...course,
                modules: modules.data
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
}

module.exports = CourseController;
