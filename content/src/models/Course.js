const db = require('../../config/db');

class Course {
    // Obtener todos los cursos
    static async getAllCourses() {
        try {
            const [courses] = await db.query(
                `SELECT c.id, c.name, c.description, c.img, c.category, o.name AS organization
                FROM courses c
                INNER JOIN organizations o ON c.organization_id = o.id`
            );
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

    static async getCategories() {
        try {
            const [courses] = await db.query(`
                SELECT category FROM courses;
            `);
            
            // Extraer categorías y eliminar duplicados usando JavaScript
            const categoriesSet = new Set();
            
            courses.forEach(course => {
                // Asegurarnos de que category esté presente y sea un JSON parseable
                if (course.category) {
                    const categoriesArray = course.category;
                    categoriesArray.forEach(cat => categoriesSet.add(cat));
                }
            });
    
            // Convertir Set a array
            return Array.from(categoriesSet);
        } catch (err) {
            throw err;
        }
    }    
    
    // Obtener todos los cursos
    static async getCoursesByOrganization(id) {
        try {
            const [courses] = await db.query(
                `SELECT 
                    c.id, 
                    c.name, 
                    c.description, 
                    (
                        SELECT COUNT(*)
                        FROM student_courses sc
                        WHERE sc.course_id = c.id
                    ) AS participants,
                    c.status
                FROM courses c
                INNER JOIN organizations o ON c.organization_id = o.id
                WHERE o.id = ?;`, [id]
            );
            return courses;
        } catch (err) {
            throw err;
        }
    }   
}

module.exports = Course;
