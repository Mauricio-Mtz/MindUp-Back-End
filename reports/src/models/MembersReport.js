const db = require('../../config/db');

class MembersReport {
  // Método para reportes de miembros
  static async reportMembers(report) {
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

    const [reports] = await db.query(query, params);
    return reports;
  }
}

module.exports = MembersReport;  