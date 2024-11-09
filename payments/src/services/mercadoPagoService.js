const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN });

class mercadoPagoService {
    static async createPaymentPreference(items, studentId) {
        try {
            const preference = new Preference(client);

            const preferenceCreated = await preference.create({
                body: {
                    additional_info: JSON.stringify({ studentId: studentId }),
                    items: items
                }
            });
            
            return preferenceCreated || {};
        } catch (error) {
            console.error("Error al crear la preferencia de pago", error);
            throw new Error("Error creando la preferencia de pago");
        }
    }
}

module.exports = mercadoPagoService;
