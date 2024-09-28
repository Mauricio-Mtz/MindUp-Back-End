// controllers/CourseController.js
const CourseModel = require('./CourseModel');

class CourseController {
    constructor() {
        this.courseModel = new CourseModel();
    }

    // Obtener todos los cursos
    async getAllCourses(req, res) {
        try {
            const courses = await this.courseModel.getAllCourses();
            res.json(courses);
        } catch (error) {
            console.error('Error al obtener los cursos:', error.message);
            res.status(500).json({ message: 'Error al obtener los cursos', error });
        }
    }

    // Crear un nuevo curso
    async createCourse(req, res) {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
        }

        try {
            const newCourse = await this.courseModel.createCourse(name, description);
            res.status(201).json(newCourse);
        } catch (error) {
            console.error('Error al crear el curso:', error.message);
            res.status(500).json({ message: 'Error al crear el curso', error });
        }
    }

    // Actualizar un curso
    async updateCourse(req, res) {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
        }

        try {
            const affectedRows = await this.courseModel.updateCourse(id, name, description);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Curso no encontrado' });
            }
            res.json({ id, name, description });
        } catch (error) {
            console.error('Error al actualizar el curso:', error.message);
            res.status(500).json({ message: 'Error al actualizar el curso', error });
        }
    }

    // Eliminar un curso
    async deleteCourse(req, res) {
        const { id } = req.params;

        try {
            const affectedRows = await this.courseModel.deleteCourse(id);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Curso no encontrado' });
            }
            res.json({ message: 'Curso eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el curso:', error.message);
            res.status(500).json({ message: 'Error al eliminar el curso', error });
        }
    }
}

module.exports = CourseController;
