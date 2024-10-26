require('dotenv').config();
const express = require('express');
const cors = require('cors');
const moduleRoutes = require('./src/routes/moduleRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usar las rutas de los cursos
app.use('/', moduleRoutes);

// Iniciar el servidor
const PORT = process.env.MODULES_PORT || 3003;
app.listen(PORT, () => {
    console.log(`Modules - ${PORT}`);
});
