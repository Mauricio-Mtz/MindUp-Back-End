const db = require('../../config/db');

class Student {
    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT id FROM students WHERE email = ?`, [email]);
        return rows[0].id;
    }

    static async getPaymentsByStudent(email) {
        const [rows] = await db.execute(`
            SELECT 
                p.id AS payment_id,
                p.subscription_id,
                p.method,
                p.transaction_id,
                p.amount,
                p.payment_date,
                p.status AS payment_status,
                p.is_current,
                s.start_date,
                s.end_date,
                s.status AS subscription_status
            FROM 
                payments p
            INNER JOIN 
                subscriptions s ON p.subscription_id = s.id
            INNER JOIN 
                students st ON s.student_id = st.id
            WHERE 
                st.email = ?
            ORDER BY 
                p.payment_date DESC;
        `, [email]);
        return rows;
    }    

    static async getSubscriptionStatusByStudent(email) {
        const [rows] = await db.execute(`
            SELECT sub.status AS subscription_status
            FROM subscriptions sub
            JOIN students st ON st.id = sub.student_id
            WHERE st.email = ?
        `, [email]);
        
        return rows.length > 0 ? rows[0].subscription_status : null;
    }    
}

module.exports = Student;