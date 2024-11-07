const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

class paymentController {
    static async getPaymentsByStudent(req, res) {
        const { email } = req.query;
        let payments = [];
        try {
            // Buscar el historial de pagos segun el usuario
            payments = await Student.getPaymentsByStudent(email);
            if (payments.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No hay historial que mostrar.',
                    data: payments,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Pagos obtenidos correctamente.',
                    data: payments,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Búsqueda de pagos fallida.',
                error: error.message,
            });
        }
    }
}

module.exports = paymentController;
