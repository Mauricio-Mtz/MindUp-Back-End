const db = require('../../config/db');
const Ajv = require('ajv'); // Usar una librería para validar JSON si es necesario
const ajv = new Ajv();

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
            WHERE course_id = ?
        `, [id]);

        return moduleDetail;
    }

    static async addNewContent(content, id, courseId) {        
        // Intenta convertir a JSON para validar
        const parsedContent = JSON.parse(content);

        // Realiza el query
        const [result] = await db.query(
            `UPDATE modules 
             SET content = ?                                      
             WHERE id = ?
             AND course_id = ?`,
            [JSON.stringify(parsedContent), id, courseId]
        );

        return result.affectedRows;
    }

    static async addNewQuestion(quiz, id, courseId) {        
        // Intenta convertir a JSON para validar
        const parsedquiz = JSON.parse(quiz);

        // Realiza el query
        const [result] = await db.query(
            `UPDATE modules 
             SET quiz = ?                                      
             WHERE id = ?
             AND course_id = ?`,
            [JSON.stringify(parsedquiz), id, courseId]
        );

        return result.affectedRows;
    }
}

module.exports = Module;
