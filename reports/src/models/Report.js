const db = require('../../config/db');

class ReportModel {
    static async getReport() {
        //reportType, report, name, startDate, endDate
        //[reportType, report, `%${name}%`, startDate, endDate]
        const [reports] = await db.query(
        `SELECT * FROM courses`
        );
        return reports;
    }
}

module.exports = ReportModel;
