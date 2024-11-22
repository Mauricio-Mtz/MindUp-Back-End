import express from 'express';
import StatisticsController from '../controllers/statistics.controller.js';

const router = express.Router();

// Ruta raíz
router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Estadísticas!');
});

// Rutas de estadísticas
router.get('/statistics/:organizationId', StatisticsController.getOrganizationStatistics);
router.get('/predictions/:organizationId', StatisticsController.getStudentProgressPrediction);

export default router;
