const StudentModel = require('./studentModel');

class StudentController {
    constructor() {
        this.studentModel = new StudentModel();
    }

    getAllStudents = async (req, res) => {
        try {
            const students = await this.studentModel.getAll();
            res.json(students);
        } catch (error) {
            console.error('Error al obtener estudiantes:', error.message);
            res.status(500).send('Error al obtener estudiantes');
        }
    };

    createStudent = async (req, res) => {
        const { type, fullname, age, country, grade, email, password } = req.body;
        try {
            const student = await this.studentModel.create({ type, fullname, age, country, grade, email, password });
            res.status(201).json(student);
        } catch (error) {
            console.error('Error al crear estudiante:', error.message);
            res.status(500).send('Error al crear estudiante');
        }
    };

    updateStudent = async (req, res) => {
        const { id } = req.params;
        const { type, fullname, age, country, grade, email, password } = req.body;
        try {
            const student = await this.studentModel.update(id, { type, fullname, age, country, grade, email, password });
            if (!student) {
                return res.status(404).send('Estudiante no encontrado');
            }
            res.json(student);
        } catch (error) {
            console.error('Error al actualizar estudiante:', error.message);
            res.status(500).send('Error al actualizar estudiante');
        }
    };

    deleteStudent = async (req, res) => {
        const { id } = req.params;
        try {
            const success = await this.studentModel.delete(id);
            if (!success) {
                return res.status(404).send('Estudiante no encontrado');
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error al eliminar estudiante:', error.message);
            res.status(500).send('Error al eliminar estudiante');
        }
    };
}

module.exports = StudentController;
