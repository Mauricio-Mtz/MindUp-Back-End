const db = require('../../config/db');

class ReportModel {
  // Método para reportes de cursos
  static async reportCourses(report, name) {
    let query = ` SELECT 
                    name curso, 
                    descriptiondescripcion, 
                    REPLACE(REPLACE(REPLACE(JSON_UNQUOTE(JSON_EXTRACT(category, '$')),'"',''), '[', ''), ']', '') AS categoria,
                    CASE 
                        WHEN status = 1 THEN 'Activo'
                        WHEN status = 0 THEN 'Inactivo'
                    END AS status 
                FROM courses                
                WHERE 1=1 `;
    const params = [];

    // Condicional para estado Activos/Inactivos
    if (report === 'Activos') {
      query += ' AND status = ?';
      params.push(1);
    } else if (report === 'Inactivos') {
      query += ' AND status = ?';
      params.push(0);
    }

    // Filtrar por nombre si está presente
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }

    // Ejecutar la consulta
    const [reports] = await db.query(query, params);
    return reports;
  }

  // Método para reportes de miembros
  static async reportMembers(report, name) {
    let query = ` SELECT 
                    fullname Nombre,
                    email Correo,
                    country Pais,
                    CASE 
                        WHEN status = 1 THEN 'Activo'
                        WHEN status = 0 THEN 'Inactivo'
                    END AS status 
                FROM members 
                WHERE 1=1`;
    const params = [];

    // Condicional para estado Activos/Inactivos
    if (report === 'Activos') {
      query += ' AND status = ?';
      params.push(1);
    } else if (report === 'Inactivos') {
      query += ' AND status = ?';
      params.push(0);
    }

    // Filtrar por nombre si está presente
    if (name) {
      query += ' AND fullname LIKE ?';
      params.push(`%${name}%`);
    }

    const [reports] = await db.query(query, params);
    return reports;
  }

  // Método para reportes de estudiantes
  static async reportStudents(report, name) {
    var query = 'SELECT * FROM students WHERE 1=1';

    switch (report){
        case 'Todos x Curso':
            query = ` SELECT 
                        s.fullname Nombre,
                        s.email Correo,
                        c.name Curso, 
                        sc.level Nivel, 
                        CASE 
                            WHEN s.status = 1 THEN 'Activo'
                            WHEN s.status = 0 THEN 'Inactivo'
                        END AS status
                    FROM courses c
                    INNER JOIN student_courses sc ON c.id = sc.course_id 
                    INNER JOIN students s ON sc.student_id = s.id
                    WHERE 1 = 1`;
            break;
        case 'Avance x curso':
            query = ` SELECT 
                        s.fullname AS Nombre,
                        c.name AS Curso, 
                        sc.level AS Nivel,
                        CONCAT(sc.progress * 100, '%') AS Progreso,
                        CASE 
                            WHEN s.status = 1 THEN 'Activo'
                            WHEN s.status = 0 THEN 'Inactivo'
                        END AS status
                    FROM courses c
                    INNER JOIN student_courses sc ON c.id = sc.course_id 
                    INNER JOIN students s ON sc.student_id = s.id
                    WHERE 1 = 1`;
            break;
        case 'Calificaciones':
            query = ` SELECT 
                        s.fullname AS Nombre,
                        s.email Correo,
                        c.name AS Curso,
                        m.name Modulo,
                        qa.score AS Puntaje,
                        CASE 
                            WHEN s.status = 1 THEN 'Activo'
                            WHEN s.status = 0 THEN 'Inactivo'
                        END AS status
                    FROM quiz_attempts qa
                    INNER JOIN modules m ON qa.module_id = m.id
                    INNER JOIN courses c ON m.course_id = c.id
                    INNER JOIN student_courses sc ON sc.id = qa.student_course_id
                    INNER JOIN students s ON sc.student_id = s.id
                    WHERE 1 = 1;
                    `;
            break;
        case 'Usuarios Terminados':
            query = ` SELECT 
                        s.fullname AS Nombre,
                        c.name AS Curso, 
                        sc.level AS Nivel,
                        CONCAT(sc.progress * 100, '%') AS Progreso,
                        CASE 
                            WHEN s.status = 1 THEN 'Activo'
                            WHEN s.status = 0 THEN 'Inactivo'
                        END AS status
                    FROM courses c
                    INNER JOIN student_courses sc ON c.id = sc.course_id 
                    INNER JOIN students s ON sc.student_id = s.id
                    WHERE 1 = 1
                    AND sc.progress >= 0.99`;
            break;
    }

    
    const params = [];

    // Filtrar por nombre si está presente
    if (name) {
      query += ' AND fullname LIKE ?';
      params.push(`%${name}%`);
    }

    

    const [reports] = await db.query(query, params);
    return reports;
  }
}

module.exports = ReportModel;
