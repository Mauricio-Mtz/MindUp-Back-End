import StatisticsModel from '../models/statistics.model.js';
import RegressionAnalysis from '../utils/regressionAnalysis.js';

class StatisticsService {
    async getOrganizationStatistics(organizationId) {
        const totalStudents = await StatisticsModel.getTotalStudents(organizationId);
        const geographicDistribution = await StatisticsModel.getStudentGeographicDistribution(organizationId);
        const averageProgress = await StatisticsModel.getAverageStudentProgress(organizationId);
        const subscriptionStats = await StatisticsModel.getSubscriptionStatistics(organizationId);

        return {
            totalStudents,
            geographicDistribution,
            averageProgress,
            ...subscriptionStats
        };
    }

    async predictStudentProgress(organizationId) {
        try {
            // Obtener datos de estudiantes para predicción
            const studentProgressData = await StatisticsModel.getStudentProgressByOrganization(organizationId);
            // console.log("RESULTADO: ", studentProgressData);
            return studentProgressData;
            // if (studentProgressData.length === 0) {
            //     return {
            //         message: "No student data available for prediction",
            //         prediction: null
            //     };
            // }

            // const predictionModel = RegressionAnalysis.predictStudentProgress(studentProgressData);
            
            // return {
            //     studentData: studentProgressData,
            //     modelCoefficients: predictionModel.coefficients,
            //     samplePrediction: predictionModel.predict([
            //         studentProgressData[0].timeSpent || 0, 
            //         studentProgressData[0].modulesCompleted || 0, 
            //         studentProgressData[0].quizzesPassed || 0
            //     ])
            // };
        } catch (error) {
            console.error("Prediction Error:", error);
            throw new Error(`Error in student progress prediction: ${error.message}`);
        }
    }
}

export default new StatisticsService();