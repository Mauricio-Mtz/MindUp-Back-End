require('dotenv').config(); // Carga las variables de entorno desde .env
const mysql = require('mysql2/promise');

// Debugging para verificar que las variables de entorno se están cargando
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

// Crear el pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Función para comprobar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos establecida correctamente.');
        await connection.release(); // Libera la conexión
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
};

// Llama a la función para probar la conexión
testConnection();

module.exports = pool; // Exporta el pool para que pueda ser usado en otros módulos
