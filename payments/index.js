require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { validarSuscripciones } = require('./src/services/subscriptionService'); // Importa la función de validación
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Programa la validación diaria a las 00:00
cron.schedule('0 0 * * *', () => {
    console.log('Ejecutando tarea de validación de suscripciones...');
    validarSuscripciones();
});

// Routes
app.use('/', paymentRoutes);

const PORT = process.env.PAYMENTS_PORT;
app.listen(PORT, () => {
    console.log(`Payments - ${PORT}`);
});