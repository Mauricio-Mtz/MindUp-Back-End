const db = require("../../config/db");

class StudentsReport {
  // Método para reportes de estudiantes
  static async reportStudents(report, course) {
    let query = "";
    let params = []; // Arreglo para los parámetros de la consulta

    switch (report) {
      case "Por Curso":
        query = `
                SELECT 
                    s.fullname AS Nombre,
                    s.email AS Correo,
                    c.name AS Curso, 
                    sc.level AS Nivel, 
                    CASE 
                        WHEN s.status = 1 THEN 'Activo'
                        WHEN s.status = 0 THEN 'Inactivo'
                    END AS status
                FROM courses c
                INNER JOIN student_courses sc ON c.id = sc.course_id 
                INNER JOIN students s ON sc.student_id = s.id
                WHERE c.id = ?
            `;
        params = [course]; // Agregar el ID del curso a los parámetros
        break;

      case "Avance por curso":
        query = `
                SELECT 
                    s.fullname AS Nombre,
                    c.name AS Curso, 
                    sc.level AS Nivel,
                    CONCAT(sc.progress, '%') AS Progreso,
                    CASE 
                        WHEN s.status = 1 THEN 'Activo'
                        WHEN s.status = 0 THEN 'Inactivo'
                    END AS status
                FROM courses c
                INNER JOIN student_courses sc ON c.id = sc.course_id 
                INNER JOIN students s ON sc.student_id = s.id
                WHERE c.id = ?
                ORDER BY sc.progress DESC;
            `;
        params = [course]; // Agregar el ID del curso a los parámetros
        break;

      case "Usuarios Terminados por curso":
        query = `
                SELECT 
                    s.fullname AS Nombre,
                    c.name AS Curso, 
                    sc.level AS Nivel,
                    CONCAT(sc.progress, '%') AS Progreso,
                    CASE 
                        WHEN s.status = 1 THEN 'Activo'
                        WHEN s.status = 0 THEN 'Inactivo'
                    END AS status
                FROM courses c
                INNER JOIN student_courses sc ON c.id = sc.course_id 
                INNER JOIN students s ON sc.student_id = s.id
                WHERE sc.progress >= 99 AND c.id = ?
            `;
        params = [course]; // Agregar el ID del curso a los parámetros
        break;

      default:
        throw new Error("Tipo de reporte no válido");
    }

    try {
      const [reports] = await db.query(query, params); // Pasar el query y los parámetros
      return reports;
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);
      throw error; // Re-lanzar el error para manejo adicional
    }
  }
}

module.exports = StudentsReport;
