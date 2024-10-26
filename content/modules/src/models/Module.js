const db = require('../../config/db');

class CourseModel {
    // Obtener todos los cursos
    static async getModulesForCourses(courseId) {
        const [modules] = await db.query(`
            SELECT 
                id,
                name,
                level
            FROM 
                modules
            WHERE 
                course_id = ?
        `, [courseId]);

        return modules; // Devolvemos el arreglo de módulos
    }

    static async getModulesByCourseId(courseId) {
        const [modules] = await db.query(`
            SELECT 
                id,
                name,
                level,
                content
            FROM 
                modules
            WHERE 
                course_id = ?
        `, [courseId]);

        return modules; // Devolvemos el arreglo de módulos
    }

    // // Crear un nuevo curso
    // static async createCourse(name, description) {
    //     const [result] = await db.query('INSERT INTO courses (name, description) VALUES (?, ?)', [name, description]);
    //     return { id: result.insertId, name, description };
    // }

    // // Actualizar un curso
    // static async updateCourse(id, name, description) {
    //     const [result] = await db.query('UPDATE courses SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    //     return result.affectedRows;
    // }

    // // Eliminar un curso
    // static async deleteCourse(id) {
    //     const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
    //     return result.affectedRows;
    // }

    // static async getCourse(courseId) {
    //     const [courses] = await db.query(`
    //         SELECT 
    //             c.id AS course_id,
    //             c.name AS course_name,
    //             c.description AS course_description
    //         FROM 
    //             courses c
    //         WHERE 
    //             c.id = ?
    //     `, [courseId]);

    //     return courses.length > 0 ? courses[0] : null;
    // }
}

module.exports = CourseModel;
