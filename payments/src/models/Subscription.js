const db = require('../../config/db');

class Subscription {
    static async findByStudentId(studentId) {
        const query = `
            SELECT * FROM subscriptions 
            WHERE student_id = ? 
            ORDER BY id DESC 
            LIMIT 1
        `;
        const [subscription] = await db.query(query, [studentId]);
        return subscription;
    }

    static async updateSubscriptionDatesAndStatus(subscriptionId, startDate, endDate, status) {
        const query = `
            UPDATE subscriptions 
            SET start_date = ?, end_date = ?, status = ?
            WHERE id = ?
        `;
        await db.query(query, [startDate, endDate, status, subscriptionId]);
    }

    static async updateSubscriptionEndDate(subscriptionId, endDate) {
        const query = `
            UPDATE subscriptions 
            SET end_date = ? 
            WHERE id = ?
        `;
        await db.query(query, [endDate, subscriptionId]);
    }

    static async createOrExtendSubscription(studentId, startDate, endDate, status) {
        const query = `
            INSERT INTO subscriptions (student_id, start_date, end_date, status)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [studentId, startDate, endDate, status]);
        return result.insertId;
    }

    static async findExpiringSubscriptions(days) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        
        const query = `
            SELECT s.*, st.email
            FROM subscriptions s
            JOIN students st ON s.student_id = st.id
            WHERE s.end_date <= ? AND (s.status = 'active' OR s.status = 'expiring')
        `;
        
        const [subscriptions] = await db.query(query, [expirationDate]);
        return subscriptions;
    }    

    static async updateSubscriptionStatus(subscriptionId, status) {
        const query = `
            UPDATE subscriptions 
            SET status = ?
            WHERE id = ?
        `;
        await db.query(query, [status, subscriptionId]);
    }
}

module.exports = Subscription;
