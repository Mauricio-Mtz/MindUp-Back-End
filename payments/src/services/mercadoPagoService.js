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
                external_reference: studentId.toString()
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

            if (response.ok) {
                const data = await response.json();
                data.external_reference = Number(data.external_reference);
                return data;
            }
            throw new Error("Error al obtener los detalles del pago");
        } catch (error) {
            console.error("Error en MercadoPagoService.getPaymentDetails:", error);
            throw error;
        }
    }   
}

module.exports = mercadoPagoService;