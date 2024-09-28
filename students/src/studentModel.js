// models/studentModel.js
const pool = require('../../config/conection/db');

const StudentModel = {
    getAll: async () => {
        const [students] = await pool.query('SELECT * FROM students');
        return students;
    },

    create: async (type, fullname, age, country, grade, email, password) => {
        const [result] = await pool.query('INSERT INTO students (type, fullname, age, country, grade, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)', [type, fullname, age, country, grade, email, password]);
        return { id: result.insertId, type, fullname, age, country, grade, email, password };
    },

    update: async (id, type, fullname, age, country, grade, email, password) => {
        const [result] = await pool.query('UPDATE students SET type = ?, fullname = ?, age = ?, country = ?, grade = ?, email = ?, password = ? WHERE id = ?', [type, fullname, age, country, grade, email, password, id]);
        if (result.affectedRows === 0) {
            return null; // Usuario no encontrado
        }
        return { id, type, fullname, age, country, grade, email, password };
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
        return result.affectedRows > 0; // Devuelve true si se eliminó
    },
};

module.exports = StudentModel;