// controllers/CourseController.js
const Module = require('../models/Module');

class ModuleController {
    static async getModulesForCourses(req, res) {
        const { id } = req.params;
        try {
            const modules = await Module.getModulesForCourses(id);
            if (modules.length === 0){
                res.status(200).json({
                    success: true,
                    message: "No hay modulos."
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Modulos obtenidos correctamente.",
                    data: modules
                });
            }
        } catch (error) {
            console.error('Error al obtener los modulos:', error.message);
            res.status(500).json({ message: 'Error al obtener los modulos', error });
        }
    }

    // static async createCourse(req, res) {
    //     const { name, description } = req.body;

    //     if (!name || !description) {
    //         return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
    //     }

    //     try {
    //         const newCourse = await Course.createCourse(name, description);
    //         res.status(201).json(newCourse);
    //     } catch (error) {
    //         console.error('Error al crear el curso:', error.message);
    //         res.status(500).json({ message: 'Error al crear el curso', error });
    //     }
    // }

    // static async updateCourse(req, res) {
    //     const { id } = req.params;
    //     const { name, description } = req.body;

    //     if (!name || !description) {
    //         return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
    //     }

    //     try {
    //         const affectedRows = await Course.updateCourse(id, name, description);
    //         if (affectedRows === 0) {
    //             return res.status(404).json({ message: 'Curso no encontrado' });
    //         }
    //         res.json({ id, name, description });
    //     } catch (error) {
    //         console.error('Error al actualizar el curso:', error.message);
    //         res.status(500).json({ message: 'Error al actualizar el curso', error });
    //     }
    // }

    // static async deleteCourse(req, res) {
    //     const { id } = req.params;

    //     try {
    //         const affectedRows = await Course.deleteCourse(id);
    //         if (affectedRows === 0) {
    //             return res.status(404).json({ message: 'Curso no encontrado' });
    //         }
    //         res.json({ message: 'Curso eliminado correctamente' });
    //     } catch (error) {
    //         console.error('Error al eliminar el curso:', error.message);
    //         res.status(500).json({ message: 'Error al eliminar el curso', error });
    //     }
    // }
}

module.exports = ModuleController;
