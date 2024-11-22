const db = require('../../config/db');

class StudentLevel {
    static async updateLevelOfStudent(studentCourseId, newLevel) {
        const query = `
            UPDATE student_courses 
            SET level = ? 
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [newLevel, studentCourseId]);
        return result.affectedRows > 0;
    }

    static async getModulesByLevel(courseId, level) {
        // Validación de parámetros
        if (!courseId || !level) {
            console.log('Missing parameters:', { courseId, level });
            return [];
        }

        const query = `
            SELECT * FROM modules 
            WHERE course_id = ? AND level = ?
        `;
        const [modules] = await db.execute(query, [courseId, level]);
        return modules;
    }

    static async getCurrentCourseProgress(studentCourseId) {
        const query = `
            SELECT sc.*, c.id as course_id
            FROM student_courses sc
            JOIN courses c ON sc.course_id = c.id
            WHERE sc.id = ?
        `;
        const [result] = await db.execute(query, [studentCourseId]);
        return result[0];
    }
}

module.exports = StudentLevel;