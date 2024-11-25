import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';

const app = express();

// Configurar morgan para loguear todas las peticiones
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Middleware para el servicio de auth
app.use('/auth', createProxyMiddleware({
    target: `http://localhost:${process.env.AUTH_PORT}`, // Dirección del microservicio de autenticación
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/auth', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Middleware para el servicio de contenido
app.use('/content', createProxyMiddleware({
    target: `http://localhost:${process.env.CONTENT_PORT}`, // Dirección del microservicio de contenido
    changeOrigin: true,
    pathRewrite: {
        '^/content': '/getAllCourses', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Middleware para el servicio de notificaciones
app.use('/notifications', createProxyMiddleware({
    target: `http://localhost:${process.env.NOTIFICATIONS_PORT}`, // Dirección del microservicio de notificaciones
    changeOrigin: true,
    pathRewrite: {
        '^/notifications': '/', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Middleware para el servicio de usuarios
app.use('/users', createProxyMiddleware({
    target: `http://localhost:${process.env.USERS_PORT}`, // Dirección del microservicio de usuarios
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/getUser', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Middleware para el servicio de reports
app.use('/reports', createProxyMiddleware({
    target: `http://localhost:${process.env.REPORTS_PORT}`, // Dirección del microservicio de reportes
    changeOrigin: true,
    pathRewrite: {
        '^/reports': '/', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Middleware para el servicio de pagos
app.use('/payments', createProxyMiddleware({
    target: `http://localhost:${process.env.PAYMENTS_PORT}`, // Dirección del microservicio de pagos
    changeOrigin: true,
    pathRewrite: {
        '^/payments': '/', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Servidor escuchando en el puerto definido en variables de entorno
const PORT = process.env.GATEWAY_PORT || 3000; // Valor por defecto 3000
app.listen(PORT, () => {
    console.log(`Gateway - ${PORT}`);
});
