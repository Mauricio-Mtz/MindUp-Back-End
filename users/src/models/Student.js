const db = require('../../config/db');

class Student {
    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT * FROM students WHERE email = ?`, [email]);
        return rows[0];
    }

    static async updateEmail(email, newEmail) {
        await db.execute(`UPDATE students SET email = ? WHERE email = ?`, [newEmail, email]);
    }

    static async updatePassword(email, hashedPassword) {
        await db.execute(`UPDATE students SET password = ? WHERE email = ?`, [hashedPassword, email]);
    }

    static async updateInformationByEmail(email, updatedData) {
        const { fullname, birthdate, country, grade } = updatedData;
        await db.execute(`
            UPDATE students SET fullname = ?, birthdate = ?, country = ?, grade = ? WHERE email = ?
        `, [fullname, birthdate, country, grade, email]);
    }

    static async getCoursesByStudent(email) {
        try {
            // Obtener el ID del estudiante por su correo
            const [studentResults] = await db.query(
                'SELECT id FROM students WHERE email = ?',
                [email]
            );
    
            // Si no se encuentra al estudiante, lanzamos un error
            if (studentResults.length === 0) {
                throw new Error('Estudiante no encontrado');
            }
    
            const studentId = studentResults[0].id;
    
            // Obtener los cursos a los que está inscrito el estudiante, junto con el nombre de la organización
            const [courses] = await db.query(
                `SELECT c.id, c.name, c.description, c.img, o.name AS organization
                FROM courses c
                INNER JOIN student_courses sc ON c.id = sc.course_id
                INNER JOIN organizations o ON c.organization_id = o.id
                WHERE sc.student_id = ? AND c.status = 1`, 
                [studentId]
            );
    
            // Retornamos los cursos encontrados
            return courses;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Student;