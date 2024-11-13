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

    static async enrollCourse(courseId, studentEmail) {
        try {
            // Obtener el ID del estudiante por su correo
            const [studentResults] = await db.query(
                'SELECT id FROM students WHERE email = ?',
                [studentEmail]
            );

            // Si no se encuentra al estudiante, lanzamos un error
            if (studentResults.length === 0) {
                throw new Error('Estudiante no encontrado');
            }
            const studentId = studentResults[0].id;

            // Verificar si el estudiante ya está inscrito en el curso
            const [existingEnrollment] = await db.query(
                'SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?',
                [studentId, courseId]
            );

            if (existingEnrollment.length > 0) {
                throw new Error('El estudiante ya está inscrito en este curso');
            }

            // Insertar la inscripción en la tabla student_courses
            await db.query(
                'INSERT INTO student_courses (student_id, course_id, level, progress) VALUES (?, ?, 1, 0)',
                [studentId, courseId]
            );

            // Retornar un mensaje de éxito
            return { success: true, message: 'Inscripción exitosa al curso' };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Student;