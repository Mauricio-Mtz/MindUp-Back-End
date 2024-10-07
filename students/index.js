const express = require('express');
const cors = require('cors');
const studentRoutes = require('./src/studentRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', studentRoutes); // Usar las rutas de estudiantes

// Iniciar el servidor
app.listen(3001, () => {
    console.log('students - 3001');
});