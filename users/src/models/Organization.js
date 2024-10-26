const db = require('../../config/db');

class Organization {
    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT * FROM organizations WHERE email = ?`, [email]);
        return rows[0];
    }

    static async updateEmail(email, newEmail) {
        await db.execute(`UPDATE organizations SET email = ? WHERE email = ?`, [newEmail, email]);
    }

    static async updatePassword(email, hashedPassword) {
        await db.execute(`UPDATE organizations SET password = ? WHERE email = ?`, [hashedPassword, email]);
    }

    static async updateInformationByEmail(email, updatedData) {
        const { name, founded, location, industry } = updatedData;
        await db.execute(`
            UPDATE organizations SET name = ?, founded = ?, location = ?, industry = ? WHERE email = ?
        `, [name, founded, location, industry, email]);
    }
}

module.exports = Organization;
