import { MultivariateLinearRegression, SimpleLinearRegression } from 'ml-regression';

class RegressionAnalysis {
    linearRegressionSimple(xData, yData) {
        const regression = new SimpleLinearRegression(xData, yData);
        return {
            predict: (x) => regression.predict(x),
            slope: regression.slope,
            intercept: regression.intercept
        };
    }

    multipleLinearRegression(features, target) {
        const regression = new MultivariateLinearRegression(features, target);
        return {
            predict: (x) => regression.predict(x),
            coefficients: regression.weights
        };
    }

    predictStudentProgress(studentData) {
        const features = studentData.map(student => [
            student.timeSpent || 0, 
            student.modulesCompleted || 0, 
            student.quizzesPassed || 0
        ]);

        const targets = studentData.map(student => student.overallProgress || 0);

        return this.multipleLinearRegression(features, targets);
    }
}

export default new RegressionAnalysis();