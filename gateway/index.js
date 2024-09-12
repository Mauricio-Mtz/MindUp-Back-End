const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();

// Configurar morgan para loguear todas las peticiones
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Middleware para el servicio de cursos
app.use('/courses', createProxyMiddleware({
    target: 'http://localhost:3001', // Dirección del microservicio de cursos
    changeOrigin: true,
    pathRewrite: {
        '^/': '/courses', // Reescribe la ruta para que coincida con las rutas en el microservicio
    },
}));

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('Gateway - 3000');
});
