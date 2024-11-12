const db = require('../../config/db');

class CourseModel {
    // Obtener todos los cursos
    static async getAllCourses() {
        try {
            // Obtener todos los cursos junto con el nombre de la organización
            const [courses] = await db.query(
                `SELECT c.id, c.name, c.description, c.img, o.name AS organization
                FROM courses c
                INNER JOIN organizations o ON c.organization_id = o.id`
            );
    
            // Retornamos los cursos encontrados
            return courses;
        } catch (err) {
            throw err;
        }
    }    

    // Crear un nuevo curso
    static async createCourse(name, description) {
        const [result] = await db.query('INSERT INTO courses (name, description) VALUES (?, ?)', [name, description]);
        return { id: result.insertId, name, description };
    }

    // Actualizar un curso
    static async updateCourse(id, name, description) {
        const [result] = await db.query('UPDATE courses SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        return result.affectedRows;
    }

    // Eliminar un curso
    static async deleteCourse(id) {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async getCourse(courseId) {
        const [courses] = await db.query(`
            SELECT 
                id,
                name,
                description,
                img,
                organization_id
            FROM 
                courses
            WHERE 
                id = ?
        `, [courseId]);

        return courses.length > 0 ? courses[0] : null;
    }
}

module.exports = CourseModel;
