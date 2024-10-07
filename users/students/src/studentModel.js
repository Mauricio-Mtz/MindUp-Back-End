const axios = require('axios');

class StudentModel {
    constructor() {
        this.dbServiceUrl = 'http://localhost:4000/query';
    }

    async getAll() {
        const response = await axios.post(this.dbServiceUrl, {
            sql: 'SELECT * FROM students',
            params: []
        });
        return response.data;
    }

    async create(student) {
        const response = await axios.post(this.dbServiceUrl, {
            sql: 'INSERT INTO students (type, fullname, age, country, grade, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            params: [student.type, student.fullname, student.age, student.country, student.grade, student.email, student.password]
        });
        return { id: response.data.insertId, ...student };
    }

    async update(id, student) {
        const response = await axios.post(this.dbServiceUrl, {
            sql: 'UPDATE students SET type = ?, fullname = ?, age = ?, country = ?, grade = ?, email = ?, password = ? WHERE id = ?',
            params: [student.type, student.fullname, student.age, student.country, student.grade, student.email, student.password, id]
        });
        if (response.data.affectedRows === 0) {
            return null;
        }
        return { id, ...student };
    }

    async delete(id) {
        const response = await axios.post(this.dbServiceUrl, {
            sql: 'DELETE FROM students WHERE id = ?',
            params: [id]
        });
        return response.data.affectedRows > 0;
    }
}

module.exports = StudentModel;
