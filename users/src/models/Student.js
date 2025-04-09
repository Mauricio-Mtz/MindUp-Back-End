const db = require('../../config/db');
const StudentProgress = require('./mongodb/progressSchema');

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
    
    static async updatePreferencesByEmail(email, newPreferences) {
        try {
            // Convertir el array de preferencias a formato JSON
            const preferencesJson = JSON.stringify(newPreferences);
            
            // Actualizar solo la columna de preferencias para el estudiante con el email especificado
            await db.execute(`
                UPDATE students SET preferences = ? WHERE email = ?
            `, [preferencesJson, email]);
    
            return true;
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
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
                `SELECT c.id, c.name, c.description, c.img, o.name AS organization, category
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
                'SELECT id, fullname FROM students WHERE email = ?',
                [studentEmail]
            );
    
            if (studentResults.length === 0) {
                return { success: false, message: 'Estudiante no encontrado' };
            }
            const studentId = studentResults[0].id;
            const studentName = studentResults[0].fullname;
    
            // Verificar si el estudiante ya está inscrito en el curso
            const [existingEnrollment] = await db.query(
                'SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?',
                [studentId, courseId]
            );
    
            if (existingEnrollment.length > 0) {
                return { success: false, message: 'El estudiante ya está inscrito en este curso' };
            }
    
            // Insertar la inscripción en la tabla student_courses
            await db.query(
                'INSERT INTO student_courses (student_id, course_id, level, progress) VALUES (?, ?, 1, 0)',
                [studentId, courseId]
            );
    
            // Obtener la información del curso
            const [courseDetails] = await db.query(
                'SELECT * FROM courses WHERE id = ?',
                [courseId]
            );
    
            if (courseDetails.length === 0) {
                return { success: false, message: 'Curso no encontrado' };
            }
    
            // Retornar éxito con los datos necesarios
            return { 
                success: true,
                message: 'Inscripción exitosa al curso',
                course: courseDetails[0], 
                student: { name: studentName, email: studentEmail } 
            };
        } catch (err) {
            throw err; // El controlador manejará errores no esperados
        }
    }    

    // Obtener el progreso actual del estudiante (actualizado para MongoDB)
    static async getProgressById(studentCourseId) {
        try {
            const progressData = await StudentProgress.findOne({ student_course_id: studentCourseId });
            return progressData ? progressData : null;
        } catch (error) {
            console.error('Error obteniendo progreso:', error);
            throw error;
        }
    }

    // Actualizar el progreso del estudiante (actualizado para MongoDB)
    static async updateModuleProgress(studentCourseId, moduleProgress) {
        try {
            // Buscar si ya existe un documento para este student_course_id
            let progressDoc = await StudentProgress.findOne({ student_course_id: studentCourseId });
            
            if (!progressDoc) {
                // Si no existe, crear un nuevo documento
                progressDoc = new StudentProgress({
                    student_course_id: studentCourseId,
                    module_progress: moduleProgress
                });
            } else {
                // Si existe, actualizar el module_progress
                progressDoc.module_progress = moduleProgress;
            }
            
            await progressDoc.save();
            return true;
        } catch (error) {
            console.error('Error actualizando progreso:', error);
            throw error;
        }
    }

    // Obtener los módulos asociados al curso del estudiante
    static async getCourseModules(studentCourseId) {
        const query = `
            SELECT m.id, sc.student_id
            FROM modules m
            JOIN courses c ON c.id = m.course_id
            JOIN student_courses sc ON sc.course_id = c.id
            WHERE sc.id = ?;
        `;
        const [rows] = await db.execute(query, [studentCourseId]);
        return rows;
    }
    
    // Actualizar el porcentaje de progreso del curso
    static async updateCourseProgress(studentCourseId, courseProgressPercentage) {
        const query = `UPDATE student_courses SET progress = ? WHERE id = ?`;
        const [result] = await db.execute(query, [courseProgressPercentage, studentCourseId]);
        return result.affectedRows > 0;
    }

    static async getStudentProgress(userId, courseId) {
        // Consulta para obtener el progreso del estudiante en el curso específico
        const query = `
            SELECT * 
            FROM student_courses 
            WHERE student_id = ? AND course_id = ?
        `;
        
        const [result] = await db.execute(query, [userId, courseId]);
        
        if (result.length > 0) {
            // Obtener el student_course_id
            const studentCourseId = result[0].id;
            
            // Obtener el progreso detallado de MongoDB
            const detailedProgress = await this.getProgressById(studentCourseId);
            
            // Transformar el formato de detailedProgress a module_progress
            const moduleProgress = {};
            if (detailedProgress && detailedProgress.module_progress) {
                console.log('Module progress data:', JSON.stringify(detailedProgress.module_progress));
                
                detailedProgress.module_progress.forEach(item => {
                    // Check if module_id exists and is not undefined
                    if (item.module_id) {
                        moduleProgress[item.module_id] = item.progress_percentage;
                    } else {
                        console.log('Warning: module_id is undefined for item:', JSON.stringify(item));
                    }
                });
            }
            
            // Combinar los resultados
            return {
                ...result[0],
                module_progress: moduleProgress
            };
        } else {
            return null; // Si no se encuentra el progreso, retorna null
        }
    }

    static async updateLevelOfStudent(studentCourseId) {
        const query = `
            UPDATE student_courses SET level = level + 1 WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [studentCourseId]);
        
        return result.affectedRows > 0;
    }      
}
module.exports = Student;