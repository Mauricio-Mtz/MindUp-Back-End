import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import stadisticRoutes from './src/routes/statistics.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usar las rutas de las estadisticas
app.use('/', stadisticRoutes);

// Iniciar el servidor
const PORT = process.env.STADISTICS_PORT;
app.listen(PORT, () => {
    console.log(`Stadistic - ${PORT}`);
});
