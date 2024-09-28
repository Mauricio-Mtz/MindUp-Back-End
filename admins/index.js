// users/index.js
const express = require('express');
const cors = require('cors');
const pool = require('./../config/db');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Obtener todos los usuarios (GET)
app.get('/read', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error.message, error.stack);
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
});

// 2. Crear un nuevo usuario (POST)
app.post('/create', async (req, res) => {
    const { type, fullname, age, country, grade, email, password } = req.body;

    if (!type || !fullname || !age || !country || !grade || !email || !password) {
        return res.status(400).json({ message: 'Todos los datos son obligatorios' });
    }

    try {
        const [result] = await pool.query('INSERT INTO users (type, fullname, age, country, grade, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)', [type, fullname, age, country, grade, email, password]);
        const newCourse = { id: result.insertId, type, fullname, age, country, grade, email, password };
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error al crear el usuario:', error.message, error.stack);
        res.status(500).json({ message: 'Error al crear el usuario', error });
    }
});

// 3. Actualizar un usuario (PUT)
app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { type, fullname, age, country, grade, email, password } = req.body;

    if (!type || !fullname || !age || !country || !grade || !email || !password) {
        return res.status(400).json({ message: 'Todos los datos son obligatorios' });
    }

    try {
        const [result] = await pool.query('UPDATE users SET type = ?, fullname = ?, age = ?, country = ?, grade = ?, email = ?, password = ? WHERE id = ?', [type, fullname, age, country, grade, email, password, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'usuario no encontrado' });
        }
        res.json({ id, type, fullname, age, country, grade, email, password });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error.message, error.stack);
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
});

// 4. Eliminar un usuario (DELETE)
app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'usuario no encontrado' });
        }
        res.json({ message: 'usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error.message, error.stack);
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
});

// Iniciar el servidor
app.listen(3001, () => {
    console.log('Users - 3001');
});
