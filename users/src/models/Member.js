const db = require('../../config/db');

class Member {
    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT * FROM members WHERE email = ?`, [email]);
        return rows[0];
    }

    static async updateEmail(email, newEmail) {
        await db.execute(`UPDATE members SET email = ? WHERE email = ?`, [newEmail, email]);
    }

    static async updatePassword(email, hashedPassword) {
        await db.execute(`UPDATE members SET password = ? WHERE email = ?`, [hashedPassword, email]);
    }

    static async updateInformationByEmail(email, updatedData) {
        const { fullname, birthdate, country, membership } = updatedData;
        await db.execute(`
            UPDATE members SET fullname = ?, birthdate = ?, country = ?, membership = ? WHERE email = ?
        `, [fullname, birthdate, country, membership, email]);
    }
}

module.exports = Member;
