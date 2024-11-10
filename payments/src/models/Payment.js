const db = require('../../config/db');

class Payment {
    // Este método se encarga de registrar el pago y actualizar o crear la suscripción
    static async createPaymentRecord(method, transactionId, status, amount, studentId) {
        console.log("STATUS modelo", status)
        // Primero, llamar al método que maneja la suscripción
        const subscriptionId = await Payment.updateOrCreateSubscription(studentId);

        // Registrar el pago en la tabla payments
        const query = `
            INSERT INTO payments (transaction_id, method, status, amount, subscription_id, is_current)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [transactionId, method, status, amount, subscriptionId, true]);

        return subscriptionId; // Devolver el ID de la suscripción
    }

    // Este método se encarga de crear o actualizar la suscripción
    static async updateOrCreateSubscription(studentId) {
        const currentDate = new Date();
    
        // Verificar si el estudiante ya tiene una suscripción activa, expirada o cancelada
        const [existingSubscription] = await db.query(
            `SELECT id, status, end_date FROM subscriptions WHERE student_id = ?`,
            [studentId]
        );
    
        let subscriptionId = null;
        let endDate = new Date(currentDate); // Por defecto, la fecha de fin será un mes después de la fecha actual
    
        if (existingSubscription[0]) {
            // Si ya existe una suscripción, obtenemos su ID, estado y fecha de expiración
            subscriptionId = existingSubscription[0].id;
            const subscriptionStatus = existingSubscription[0].status;
            const currentEndDate = new Date(existingSubscription[0].end_date);
    
            if (subscriptionStatus === 'active') {
                // Si está activa, extendemos la fecha de expiración (agregamos un mes a la fecha actual de fin)
                endDate = new Date(currentEndDate);
                endDate.setMonth(endDate.getMonth() + 1); // Aumentamos un mes a la fecha de expiración actual
    
                const query = `
                    UPDATE subscriptions
                    SET end_date = ?
                    WHERE id = ?
                `;
                await db.query(query, [endDate, subscriptionId]);
            } else if (subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled') {
                // Si la suscripción está expirada o cancelada, reiniciamos las fechas
                endDate.setMonth(currentDate.getMonth() + 1); // Aumentamos un mes a la fecha actual
    
                const query = `
                    UPDATE subscriptions
                    SET start_date = ?, end_date = ?, status = 'active'
                    WHERE id = ?
                `;
                await db.query(query, [currentDate, endDate, subscriptionId]);
            }
        } else {
            // Si no existe ninguna suscripción, creamos una nueva
            endDate.setMonth(currentDate.getMonth() + 1); // Aumentamos un mes a la fecha actual
    
            const query = `
                INSERT INTO subscriptions (student_id, start_date, end_date, status)
                VALUES (?, ?, ?, 'active')
            `;
            const [result] = await db.query(query, [studentId, currentDate, endDate]);
            subscriptionId = result.insertId; // Obtener el ID de la nueva suscripción
        }
    
        return subscriptionId; // Devolver el ID de la suscripción (ya sea nueva o existente)
    }    
}

module.exports = Payment;