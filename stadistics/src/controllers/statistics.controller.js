import StatisticsService from '../services/statistics.service.js';

class StatisticsController {
    async getOrganizationStatistics(req, res) {
        try {
            const { organizationId } = req.params;
            const statistics = await StatisticsService.getOrganizationStatistics(organizationId);
            res.json(statistics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStudentProgressPrediction(req, res) {
        try {
            const { organizationId } = req.params;
            const prediction = await StatisticsService.predictStudentProgress(organizationId);
            res.json(prediction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new StatisticsController();