const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({ 
    accessToken: process.env.ACCESS_TOKEN
});

class mercadoPagoService {
    static async createPaymentPreference(items, studentEmail) {
        try {
            const body = {
                items: items,
                back_urls: {
                    success: 'https://codeflex.space/account/payments',
                    failure: 'https://codeflex.space/account/payments',
                    pending: 'https://codeflex.space/account/payments'
                },
                auto_return: "approved",
                notification_url: 'https://mindup-back-end.onrender.com/payments/receive-mercadopago-webhook',
                external_reference: studentEmail.toString()
            }
    
            const preference = new Preference(client);
            const result = await preference.create({ body });
    
            return { id: result.id };
        } catch (error) {
            console.error("Error al crear la preferencia de pago", error);
            throw new Error("Error creando la preferencia de pago");
        }
    } 

    static async getPaymentDetails(paymentId) {
        try {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
                }
            });
    
            const data = await response.json();
            console.log(data)
            return data;
        } catch (error) {
            console.error("Error en MercadoPagoService.getPaymentDetails:", error);
            throw error;
        }
    }
}

module.exports = mercadoPagoService;