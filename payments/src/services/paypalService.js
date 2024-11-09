const axios = require('axios');

class paypalService {
    static async createOrder(amount, currency) {
        const client_id = process.env.PAYPAL_CLIENT_ID;
        const client_secret = process.env.PAYPAL_CLIENT_SECRET;
    
        const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
        const orderData = {
            "intent": 'CAPTURE',
            "purchase_units": [
                { "amount": { 
                    "currency_code": currency, 
                    "value": amount
                 } }
            ],
        };
    
        try {
            const response = await axios.post('https://api.sandbox.paypal.com/v2/checkout/orders', orderData, {
                headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
            });
            
            const orderId = response.data.id;
            return { orderId };
        } catch (error) {
            console.error('Error en la creación de orden en PayPal:', error);
            throw new Error('Error al crear la orden en PayPal');
        }
    }    
    
    static async capturePayment(orderId) {
        const client_id = process.env.PAYPAL_CLIENT_ID;
        const client_secret = process.env.PAYPAL_CLIENT_SECRET;
        const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
        
        try {
            const response = await axios.post(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {}, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                }
            });
    
            // Obtener el estado de la captura y el orderId
            const paymentStatus = response.data.status;
            const transactionIdCaptured = response.data.id;
    
            // Retornar tanto el orderId como el status del pago
            return { transactionId: transactionIdCaptured, status: paymentStatus };
        } catch (error) {
            console.error('Error al capturar la orden:', error);
            throw new Error('Error al capturar la orden');
        }
    }
}

module.exports = paypalService;