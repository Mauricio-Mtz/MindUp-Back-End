const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({ 
    accessToken: process.env.ACCESS_TOKEN
});

class mercadoPagoService {
    static async createPaymentPreference(items, studentId) {
        try {
            
            const body = {
                items: items,
                back_urls: {
                    success: 'https://codeflex.space',
                    failure: 'https://codeflex.space/catalog',
                    pending: 'https://codeflex.space/catalog'
                },
                auto_return: "approved",
                notification_url: 'https://mindup-back-end.onrender.com/payments/receive-mercadopago-webhook',
                additional_info: JSON.stringify({ studentId: studentId }),
            }

            const preference = new Preference(client);
            const result = await preference.create({ body });

            return { id: result.id };
        } catch (error) {
            console.error("Error al crear la preferencia de pago", error);
            throw new Error("Error creando la preferencia de pago");
        }
    }
}

module.exports = mercadoPagoService;