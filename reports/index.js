require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reportRoutes = require('./src/routes/reportRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usar las rutas de los reportes
app.use('/', reportRoutes);

// Iniciar el servidor
const PORT = process.env.REPORTS_PORT;
app.listen(PORT, () => {
    console.log(`Reports - ${PORT}`);
});
