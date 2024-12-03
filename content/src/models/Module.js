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

    static async getModuleDetailCatalog(id) {
        const [moduleDetail] = await db.query(`
            SELECT *
            FROM modules
            WHERE id = ?
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

    static async addNewModule(name, level, courseId) {
        // Realiza el query
        const [result] = await db.query(
            `INSERT INTO modules (name, level, course_id) VALUES (?, ?, ?)`,
            [name, level, courseId]
        );

        return result.affectedRows;
    }

    static async deleteModule(id) {
        const [result] = await db.query('DELETE FROM modules WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async deleteSection(sectionId, moduleId) {        
        try {   
            // Obtenemos la seccion actual del módulo
            const [module] = await db.query(`
                SELECT content
                FROM modules
                WHERE id = ?
            `, [moduleId]);
            
            if (!module || !module[0].content) {
                throw new Error("No se encontró el módulo o el campo 'quiz' está vacío.");
            }
            
            // Parseamos el campo JSON del quiz
            const content = module[0].content;
            // Verificamos si la pregunta existe en el índice proporcionado
            if (!content || !content[sectionId]) {
                throw new Error("No se encontró la pregunta con el índice especificado.");
            }
    
            // Removemos la pregunta del array de preguntas
            content.splice(sectionId, 1);
    
            // Actualizamos el campo `content` con el nuevo JSON
            const result = await db.query(`
                UPDATE modules
                SET content = ?
                WHERE id = ?
            `, [JSON.stringify(content), moduleId]);

            return result.affectedRows;
        } catch (error) {
            console.error("Error al eliminar el contenido:", error.message);
            throw error;
        }
    }

    static async deleteQuestion(questionId, moduleId) {
        try {   
            // Obtenemos el quiz actual del módulo
            const [module] = await db.query(`
                SELECT quiz
                FROM modules
                WHERE id = ?
            `, [moduleId]);

            
            if (!module || !module[0].quiz) {
                throw new Error("No se encontró el módulo o el campo 'quiz' está vacío.");
            }
            
            // Parseamos el campo JSON del quiz
            const quiz = module[0].quiz;
            // console.log("Quizzes", quiz);
            // Verificamos si la pregunta existe en el índice proporcionado
            if (!quiz.questions || !quiz.questions[questionId]) {
                throw new Error("No se encontró la pregunta con el índice especificado.");
            }
    
            // Removemos la pregunta del array de preguntas
            quiz.questions.splice(questionId, 1);
    
            // Actualizamos el campo `quiz` con el nuevo JSON
            const result = await db.query(`
                UPDATE modules
                SET quiz = ?
                WHERE id = ?
            `, [JSON.stringify(quiz), moduleId]);

            return result.affectedRows;
        } catch (error) {
            console.error("Error al eliminar la pregunta:", error.message);
            throw error;
        }
    }    
}

module.exports = Module;
