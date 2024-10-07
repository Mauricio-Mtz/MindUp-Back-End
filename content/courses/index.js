// index.js
const express = require('express');
const cors = require('cors');
const courseRoutes = require('./src/CourseRoutes');
const app = express();

app.use(cors());
app.use(express.json());

// Usar las rutas de los cursos
app.use('/courses', courseRoutes);

// Iniciar el servidor
app.listen(3002, () => {
    console.log('Courses service running on port 3002');
});
