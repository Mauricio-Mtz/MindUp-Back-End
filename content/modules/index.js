// modules/index.js
const express = require('express');
const cors = require('cors');
const pool = require('./../config/db');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Obtener todos los módulos (GET)
app.get('/read', async (req, res) => {
    try {
        const [modules] = await pool.query('SELECT * FROM modules');
        res.json(modules);
    } catch (error) {
        console.error('Error al obtener los módulos:', error.message, error.stack);
        res.status(500).json({ message: 'Error al obtener los módulos', error });
    }
});

app.post('/create', async (req, res) => {
    const { course_id, name, level, content } = req.body;

    if (!course_id || !name || !level || !content) {
        return res.status(400).json({ message: 'Todos los datos son obligatorios' });
    }

    try {
        // Convertir el objeto JSON a una cadena
        const contentString = JSON.stringify(content);

        // Hacer la consulta
        const [result] = await pool.query('INSERT INTO modules (course_id, name, level, content) VALUES (?, ?, ?, ?)', [course_id, name, level, contentString]);
        const newModule = { id: result.insertId, course_id, name, level, content };
        res.status(201).json(newModule);
    } catch (error) {
        console.error('Error al crear el módulo:', error.message, error.stack);
        res.status(500).json({ message: 'Error al crear el módulo', error });
    }
});


// 3. Actualizar un módulo (PUT)
app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { course_id, name, level, content } = req.body;

    if (!course_id || !name || !level || !content) {
        return res.status(400).json({ message: 'Todos los datos son obligatorios' });
    }

    try {
        const [result] = await pool.query('UPDATE modules SET course_id = ?, name = ?, level = ?, content = ? WHERE id = ?', [course_id, name, level, content, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }
        res.json({ id, course_id, name, level, content });
    } catch (error) {
        console.error('Error al actualizar el módulo:', error.message, error.stack);
        res.status(500).json({ message: 'Error al actualizar el módulo', error });
    }
});

// 4. Eliminar un módulo (DELETE)
app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM modules WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }
        res.json({ message: 'Módulo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el módulo:', error.message, error.stack);
        res.status(500).json({ message: 'Error al eliminar el módulo', error });
    }
});

// Iniciar el servidor
app.listen(3003, () => {
    console.log('Modules - 3003');
});