// courses/index.js
const express = require('express');
const cors = require('cors');
const pool = require('./../config/db'); // Asegúrate de que el archivo db.js esté en la ubicación correcta
const app = express();

app.use(cors());
app.use(express.json());

// 1. Obtener todos los cursos (GET)
app.get('/courses', async (req, res) => {
    console.log('Solicitando datos');
    try {
        const [courses] = await pool.query('SELECT * FROM courses');
        res.json(courses);
    } catch (error) {
        console.error('Error al obtener los cursos:', error.message, error.stack);
        res.status(500).json({ message: 'Error al obtener los cursos', error });
    }
});

// 2. Crear un nuevo curso (POST)
app.post('/courses', async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
    }

    try {
        const [result] = await pool.query('INSERT INTO courses (name, description) VALUES (?, ?)', [name, description]);
        const newCourse = { id: result.insertId, name, description };
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error al crear el curso:', error.message, error.stack);
        res.status(500).json({ message: 'Error al crear el curso', error });
    }
});

// 3. Actualizar un curso (PUT)
app.put('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' });
    }

    try {
        const [result] = await pool.query('UPDATE courses SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        res.json({ id, name, description });
    } catch (error) {
        console.error('Error al actualizar el curso:', error.message, error.stack);
        res.status(500).json({ message: 'Error al actualizar el curso', error });
    }
});

// 4. Eliminar un curso (DELETE)
app.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        res.json({ message: 'Curso eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el curso:', error.message, error.stack);
        res.status(500).json({ message: 'Error al eliminar el curso', error });
    }
});

// Iniciar el servidor
app.listen(3001, () => {
    console.log('Cursos - 3001');
});
