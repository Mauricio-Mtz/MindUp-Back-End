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
// Middleware para el servicio de usuarios
app.use('/students', createProxyMiddleware({
    target: 'http://localhost:3001', // Dirección del microservicio de cursos
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/users', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));
// Middleware para el servicio de cursos
app.use('/courses', createProxyMiddleware({
    target: 'http://localhost:3002', // Dirección del microservicio de cursos
    changeOrigin: true,
    pathRewrite: {
        '^/courses': '/courses', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));
// Middleware para el servicio de modulos
app.use('/modules', createProxyMiddleware({
    target: 'http://localhost:3003', // Dirección del microservicio de modulos
    changeOrigin: true,
    pathRewrite: {
        '^/modulos': '/read', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('Gateway - 3000');
});
