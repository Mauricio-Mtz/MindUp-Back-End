const StudentLevel = require('../models/StudentLevel');

class LevelSystemController {
    static calculateAccuracyScore(correctAnswers, totalQuestions) {
        return (correctAnswers / totalQuestions) * 40;
    }

    static calculateTimeScore(completionTime, totalQuestions) {
        const optimalTime = 90 * totalQuestions;
        if (completionTime <= optimalTime) return 25;
        
        const extraTime = completionTime - optimalTime;
        const penaltyPoints = Math.floor(extraTime / 30) * 5;
        return Math.max(0, 25 - penaltyPoints);
    }

    static calculateDifficultyScore(moduleLevel) {
        const difficultyScores = {
            1: 4, 2: 8, 3: 12, 4: 16, 5: 20
        };
        return difficultyScores[moduleLevel] || 4;
    }

    static calculateAttemptsScore(attempts) {
        if (attempts === 1) return 15;
        if (attempts === 2) return 10;
        if (attempts === 3) return 5;
        return 0;
    }

    static calculateBonusPenalties(correctAnswers, totalQuestions, completionTime, attempts) {
        let bonusPoints = 0;

        // Bonificaciones
        if (correctAnswers === totalQuestions) bonusPoints += 5; // Quiz perfecto
        if (completionTime < (30 * totalQuestions)) bonusPoints += 3; // Tiempo récord

        // Penalizaciones
        if (attempts > 3) bonusPoints -= 5;
        if (completionTime > (180 * totalQuestions)) bonusPoints -= 3;

        return bonusPoints;
    }

    static determineLevel(score) {
        if (score >= 90) return 5;
        if (score >= 80) return 4;
        if (score >= 65) return 3;
        if (score >= 50) return 2;
        return 1;
    }

    static async processQuizResult(moduleData, studentCourseId) {
        try {
            // Primero obtenemos los datos completos del curso del estudiante
            const studentCourse = await StudentLevel.getCurrentCourseProgress(studentCourseId);
            
            if (!studentCourse) {
                throw new Error('No se encontró el curso del estudiante');
            }

            const accuracyScore = this.calculateAccuracyScore(
                moduleData.correct_answers, 
                moduleData.total_questions
            );
            
            const timeScore = this.calculateTimeScore(
                moduleData.completionTime,
                moduleData.total_questions
            );
            
            const difficultyScore = this.calculateDifficultyScore(moduleData.level);
            const attemptsScore = this.calculateAttemptsScore(moduleData.attempts);
            
            const bonusPenalties = this.calculateBonusPenalties(
                moduleData.correct_answers,
                moduleData.total_questions,
                moduleData.completionTime,
                moduleData.attempts
            );

            const totalScore = accuracyScore + timeScore + difficultyScore + 
                             attemptsScore + bonusPenalties;

            // Parsear el progreso del módulo de manera segura
            let currentProgress;
            try {
                currentProgress = typeof studentCourse.module_progress === 'string' 
                    ? JSON.parse(studentCourse.module_progress)
                    : studentCourse.module_progress || [];
            } catch (e) {
                console.error('Error parsing module_progress:', e);
                currentProgress = [];
            }

            const currentLevel = studentCourse.level || 1;
            
            // Obtener módulos del nivel actual
            const modulesInCurrentLevel = await StudentLevel.getModulesByLevel(
                studentCourse.course_id, 
                currentLevel
            );

            console.log('Datos del curso:', {
                courseId: studentCourse.course_id,
                currentLevel,
                modulesFound: modulesInCurrentLevel.length
            });

            // Si no hay módulos, usar un valor predeterminado para evitar división por cero
            const totalModules = modulesInCurrentLevel.length || 1;

            // Verificar condiciones para subir de nivel
            const completedModules = Array.isArray(currentProgress) 
                ? currentProgress.filter(m => m.progress_percentage >= 70).length 
                : 0;
            
            const completionRate = completedModules / totalModules;
            const averageScore = Array.isArray(currentProgress) && currentProgress.length > 0
                ? currentProgress.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / currentProgress.length
                : 0;

            // Verificar si cumple con los requisitos para subir de nivel
            if (
                completionRate >= 0.8 && // 80% de módulos completados
                averageScore >= this.getMinimumScoreForLevel(currentLevel) &&
                totalScore > 70 && // Al menos un módulo del siguiente nivel con >70 puntos
                currentLevel < 5 // No está en el nivel máximo
            ) {
                await StudentLevel.updateLevelOfStudent(
                    studentCourse.id, 
                    currentLevel + 1
                );
            }

            return {
                totalScore,
                details: {
                    accuracyScore,
                    timeScore,
                    difficultyScore,
                    attemptsScore,
                    bonusPenalties
                },
                currentLevel,
                completionRate,
                averageScore
            };
        } catch (error) {
            console.error('Error en processQuizResult:', error);
            throw error;
        }
    }

    static getMinimumScoreForLevel(level) {
        const minimumScores = {
            1: 0,
            2: 50,
            3: 65,
            4: 80,
            5: 90
        };
        return minimumScores[level] || 0;
    }
}

module.exports = LevelSystemController;