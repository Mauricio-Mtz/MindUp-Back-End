require('dotenv').config();
const express = require('express');
const cors = require('cors');
const courseRoutes = require('./src/routes/courseRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usar las rutas de los cursos
app.use('/', courseRoutes);

// Iniciar el servidor
const PORT = process.env.COURSES_PORT;
app.listen(PORT, () => {
    console.log(`Courses - ${PORT}`);
});
