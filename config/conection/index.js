const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.DB_SERVICE_PORT || 4000;

let pool;

const getPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
};

app.use(express.json());

app.post('/query', async (req, res) => {
    const { sql, params } = req.body;
    try {
        const pool = getPool();
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error.message);
        res.status(500).send('Error al ejecutar la consulta');
    }
});

app.listen(port, () => {
    console.log(`Servicio de base de datos escuchando en http://localhost:${port}`);
});
