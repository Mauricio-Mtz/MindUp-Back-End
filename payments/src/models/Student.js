const db = require('../../config/db');

class Student {
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
}

module.exports = Student;