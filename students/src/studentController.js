// controllers/studentController.js
const StudentModel = require('./studentModel');

const studentController = {
    getAllStudents: async (req, res) => {
        try {
            const students = await StudentModel.getAll();
            res.json(students);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error.message, error.stack);
            res.status(500).json({ message: 'Error al obtener los usuarios', error });
        }
    },

    createStudent: async (req, res) => {
        const { type, fullname, age, country, grade, email, password } = req.body;

        if (!type || !fullname || !age || !country || !grade || !email || !password) {
            return res.status(400).json({ message: 'Todos los datos son obligatorios' });
        }

        try {
            const newStudent = await StudentModel.create(type, fullname, age, country, grade, email, password);
            res.status(201).json(newStudent);
        } catch (error) {
            console.error('Error al crear el usuario:', error.message, error.stack);
            res.status(500).json({ message: 'Error al crear el usuario', error });
        }
    },

    updateStudent: async (req, res) => {
        const { id } = req.params;
        const { type, fullname, age, country, grade, email, password } = req.body;

        if (!type || !fullname || !age || !country || !grade || !email || !password) {
            return res.status(400).json({ message: 'Todos los datos son obligatorios' });
        }

        try {
            const updatedStudent = await StudentModel.update(id, type, fullname, age, country, grade, email, password);
            if (!updatedStudent) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json(updatedStudent);
        } catch (error) {
            console.error('Error al actualizar el usuario:', error.message, error.stack);
            res.status(500).json({ message: 'Error al actualizar el usuario', error });
        }
    },

    deleteStudent: async (req, res) => {
        const { id } = req.params;

        try {
            const result = await StudentModel.delete(id);
            if (!result) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el usuario:', error.message, error.stack);
            res.status(500).json({ message: 'Error al eliminar el usuario', error });
        }
    },
};

module.exports = studentController;