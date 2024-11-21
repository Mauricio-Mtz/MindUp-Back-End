const db = require('../../config/db');

class CoursesReport {
  // Método para reportes de cursos
  static async reportCourses(report) {
    let query = ` SELECT 
                    name curso, 
                    description descripcion, 
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

    // Ejecutar la consulta
    const [reports] = await db.query(query, params);
    return reports;
  }
}

module.exports = CoursesReport;  