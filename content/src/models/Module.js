const db = require('../../config/db');

class Module {
    // Obtener todos los cursos
    static async getModulesForCourses(courseId) {
        const [modules] = await db.query(`
            SELECT id, name, level
            FROM modules
            WHERE course_id = ?
        `, [courseId]);

        return modules;
    }
    static async getModuleDetail(id) {
        const [moduleDetail] = await db.query(`
            SELECT *
            FROM modules
            WHERE id = ?
        `, [id]);

        return moduleDetail[0];
    }
}

module.exports = Module;
