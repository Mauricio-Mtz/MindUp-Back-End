const db = require('../../config/db');

class Course {
    // Obtener todos los cursos
    static async getAllCourses() {
        try {
            const [courses] = await db.query(
                `SELECT c.id, c.name, c.description, c.img, c.category, o.name AS organization, c.status
                FROM courses c
                INNER JOIN organizations o ON c.organization_id = o.id`
            );
            return courses;
        } catch (err) {
            throw err;
        }
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

    static async createCourse(courseData) {
        try {
            const { name, description, img, organization_id, category } = courseData;

            // Inserción en la base de datos
            const [result] = await db.query(
                `
                INSERT INTO courses (name, description, img, organization_id, category)
                VALUES (?, ?, ?, ?, ?)
            `,
                [name, description, img, organization_id, JSON.stringify(category)] // Convertir categoría a JSON string
            );

            // Retornar el ID del nuevo curso y los datos
            return { id: result.insertId, ...courseData };
        } catch (err) {
            console.error("Error al insertar el curso:", err);
            throw err;
        }
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

    static async toggleCourseStatus(id) {
        // Primero obtenemos el estado actual del curso
        const [rows] = await db.query('SELECT status FROM courses WHERE id = ?', [id]);
        if (rows.length === 0) {
            throw new Error('Curso no encontrado');
        }
    
        // Invertimos el estado
        const currentStatus = rows[0].status;
        const newStatus = currentStatus === 1 ? 0 : 1;
    
        // Actualizamos el estado del curso
        const [result] = await db.query('UPDATE courses SET status = ? WHERE id = ?', [newStatus, id]);
        
        return result.affectedRows;
    }    
}

module.exports = Course;
