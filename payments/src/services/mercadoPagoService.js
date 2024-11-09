const mercadopago = require('mercadopago');
mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN,
});

class mercadoPagoService {
    static async createPaymentPreference (items, studentId) {
        try {
            // Aquí creamos la preferencia de pago con MercadoPago SDK
            const preference = {
                items: items,
                back_urls: {
                    success: 'https://tu-servidor.com/success', // URL de éxito
                    failure: 'https://tu-servidor.com/failure', // URL de fallo
                    pending: 'https://tu-servidor.com/pending'  // URL de pendiente
                },
                additional_info: {
                    studentId: studentId  // Aquí guardas el studentId en el campo adicional
                }
            };

            const preferenceCreated = await mercadoPago.preferences.create(preference);
            return preferenceCreated.response;
        } catch (error) {
            throw new Error('Error creando la preferencia de pago');
        }
    }
}

module.exports = mercadoPagoService;
