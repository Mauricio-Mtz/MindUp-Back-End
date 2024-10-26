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
}

module.exports = Student;