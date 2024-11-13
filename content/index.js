require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contentRoutes = require('./src/routes/contentRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usar las rutas del contenido
app.use('/', contentRoutes);

// Iniciar el servidor
const PORT = process.env.CONTENT_PORT;
app.listen(PORT, () => {
    console.log(`Content - ${PORT}`);
});
