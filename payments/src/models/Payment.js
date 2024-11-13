const db = require('../../config/db');

class Payment {

    static async markPreviousPaymentsAsNotCurrent(subscriptionId) {
        const query = `
            UPDATE payments 
            SET is_current = false 
            WHERE subscription_id = ? AND is_current = true
        `;
        await db.query(query, [subscriptionId]);
    }

    static async createPaymentRecord(transactionId, method, status, amount, subscriptionId) {
        const query = `
            INSERT INTO payments (transaction_id, method, status, amount, subscription_id, is_current)
            VALUES (?, ?, ?, ?, ?, true)
        `;
        await db.query(query, [transactionId, method, status, amount, subscriptionId]);
    }
}

module.exports = Payment;