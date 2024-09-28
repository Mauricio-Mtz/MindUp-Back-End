// // index.js
// const express = require('express');
// const cors = require('cors');
// const studentRoutes = require('./src/studentRoutes');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/students', studentRoutes); // Usar las rutas de estudiantes

// // Iniciar el servidor
// app.listen(3001, () => {
//     console.log('students - 3001');
// });




const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

const dbServiceUrl = `http://localhost:4000/query`;

// Ruta para obtener todos los estudiantes
app.get('/students', async (req, res) => {
    try {
        const response = await axios.post(dbServiceUrl, {
            sql: 'SELECT * FROM students',
            params: []
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error.message);
        res.status(500).send('Error al obtener estudiantes');
    }
});

// Ruta para crear un nuevo estudiante
app.post('/students', async (req, res) => {
    const { type, fullname, age, country, grade, email, password } = req.body;
    try {
        const response = await axios.post(dbServiceUrl, {
            sql: 'INSERT INTO students (type, fullname, age, country, grade, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            params: [type, fullname, age, country, grade, email, password]
        });
        res.status(201).json({ id: response.data.insertId, type, fullname, age, country, grade, email, password });
    } catch (error) {
        console.error('Error al crear estudiante:', error.message);
        res.status(500).send('Error al crear estudiante');
    }
});

// Ruta para actualizar un estudiante
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { type, fullname, age, country, grade, email, password } = req.body;
    try {
        const response = await axios.post(dbServiceUrl, {
            sql: 'UPDATE students SET type = ?, fullname = ?, age = ?, country = ?, grade = ?, email = ?, password = ? WHERE id = ?',
            params: [type, fullname, age, country, grade, email, password, id]
        });
        if (response.data.affectedRows === 0) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.json({ id, type, fullname, age, country, grade, email, password });
    } catch (error) {
        console.error('Error al actualizar estudiante:', error.message);
        res.status(500).send('Error al actualizar estudiante');
    }
});

// Ruta para eliminar un estudiante
app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.post(dbServiceUrl, {
            sql: 'DELETE FROM students WHERE id = ?',
            params: [id]
        });
        if (response.data.affectedRows === 0) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar estudiante:', error.message);
        res.status(500).send('Error al eliminar estudiante');
    }
});

app.listen(port, () => {
    console.log(`Servicio de estudiantes escuchando en http://localhost:${port}`);
});
