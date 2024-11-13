require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();

// Configurar morgan para loguear todas las peticiones
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Middleware para el servicio de auth
app.use('/auth', createProxyMiddleware({
    target: 'http://localhost:3001', // Dirección del microservicio de cursos
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/auth', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));
// Middleware para el servicio de cursos
app.use('/content', createProxyMiddleware({
    target: 'http://localhost:3002', // Dirección del microservicio de cursos
    changeOrigin: true,
    pathRewrite: {
        '^/content': '/getAllCourses', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));
// Middleware para el servicio de usuarios
app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/getUser',
    },
}));
// Middleware para el servicio de pagos
app.use('/payments', createProxyMiddleware({
    target: 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: {
        '^/payments': '/getPaymentsByStudent',
    },
}));
// Middleware para el servicio de notificaciones
app.use('/notifications', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/notifications': '/',
    },
}));

// Servidor escuchando en el puerto 3000
const PORT = process.env.GATEWAY_PORT;
app.listen(PORT, () => {
    console.log(`Gateway - ${PORT}`);
});
