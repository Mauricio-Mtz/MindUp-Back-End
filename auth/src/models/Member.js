const jwt = require('jsonwebtoken');
const secretKey = '1224';

const db = require('../../config/db');

class Member {
    static async create(email, password, name, typeRegister) {
        let query;
        let params;
        
        if (typeRegister === 'native') {
            query = `INSERT INTO members (email, password, fullname) VALUES (?, ?, ?)`;
            params = [email, password, name];
        } else {
            query = `INSERT INTO members (email, password) VALUES (?, ?)`;
            params = [email, password];
        }
    
        // Ejecutar la inserción y obtener el ID del miembro insertado
        const [result] = await db.execute(query, params);
    
        // Obtener el ID del nuevo miembro
        const insertId = result.insertId;
    
        // Realizar una consulta para obtener el miembro recién creado
        const [rows] = await db.execute(`SELECT * FROM members WHERE id = ?`, [insertId]);
    
        // Devolver el miembro recién creado (el primer resultado de la consulta)
        return rows[0];
    }    

    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT * FROM members WHERE email = ?`, [email]);
        return rows[0];
    }

    static async updateDetails(email, name, password, country, token) {
        // Primero, buscamos el ID del miembro utilizando su email
        const [idUser] = await db.execute(`SELECT id FROM members WHERE email = ?`, [email]);
            
        // Validamos si el miembro existe
        if (idUser.length === 0) {
            throw new Error('Miembro no encontrado');
        }
    
        const id = idUser[0].id; // Obtenemos el ID del Member
    
        // Buscamos la ID de la organización usando el token
        const [orgUser] = await db.execute(`SELECT id FROM organizations WHERE token = ?`, [token]);
        
        // Validamos si la organización existe
        if (orgUser.length === 0) {
            throw new Error('Organización no encontrada');
        }
    
        const organization_id = orgUser[0].id; // Obtenemos la ID de la organización
    
        // Construimos la consulta de actualización
        let query = `UPDATE members SET country = ?, organization_id = ?`;
        const params = [country, organization_id]; // Parámetros obligatorios
    
        // Verificamos si el nombre fue proporcionado
        if (name !== "") {
            query += `, fullname = ?`; // Agregamos el nombre a la consulta
            params.push(name); // Agregamos el nombre a los parámetros
        }
    
        // Verificamos si la contraseña fue proporcionada
        if (password !== null && password !== "") {
            query += `, password = ?`; // Agregamos la contraseña a la consulta
            params.push(password); // Agregamos la contraseña a los parámetros
        }
    
        // Añadimos la condición para el ID
        query += ` WHERE id = ?`;
        params.push(id); // Agregamos el ID al final de los parámetros
    
        // Ejecutamos la consulta
        let result = await db.execute(query, params);

        if (result[0].affectedRows > 0) {
            return true;
        } else {
            return false
        }
    }    
}

module.exports = Member;
