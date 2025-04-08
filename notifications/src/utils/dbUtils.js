const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mindup'
};

// Clase para manejar conexiones a la base de datos
class DBUtils {
    constructor() {
        this.pool = mysql.createPool(dbConfig);
    }

    /**
     * Ejecuta una consulta SQL
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros para la consulta
     * @returns {Promise<Array>} - Resultados de la consulta
     */
    async query(sql, params = []) {
        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Error en la consulta a la base de datos:', error);
            throw error;
        }
    }

    /**
     * Ejecuta una transacción
     * @param {Function} callback - Función que contiene las consultas
     * @returns {Promise<any>} - Resultado de la transacción
     */
    async transaction(callback) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new DBUtils();