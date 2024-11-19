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
        const [rows] = await db.execute(`
            SELECT members.*, organizations.name AS organization_name
            FROM members
            LEFT JOIN organizations ON members.organization_id = organizations.id
            WHERE members.id = ?`, [insertId]);
    
        // Devolver el miembro recién creado (el primer resultado de la consulta)
        return rows[0];
    }    

    static async findByEmail(email) {
        const [rows] = await db.execute(`
            SELECT members.*, organizations.name AS organization_name
            FROM members
            LEFT JOIN organizations ON members.organization_id = organizations.id
            WHERE members.email = ?`, [email]);
        return rows[0];
    }    

    static async updateDetails(email, name, password, country, token) {
        // Decodificar el código de la organización
        const decodedCode = atob(token); // Decodificamos el código
        const orgData = JSON.parse(decodedCode); // Convertimos de nuevo a objeto
    
        const { orgId, orgName, currentDate } = orgData; // Extraemos los datos de la organización
    
        // Validar la fecha actual
        const currentDateString = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
        if (currentDate !== currentDateString) {
            throw new Error('El código ha expirado');
        }
    
        // Buscar la organización por ID y nombre
        const [organization] = await db.execute(`SELECT * FROM organizations WHERE id = ? AND name = ?`, [orgId, orgName]);
    
        // Validar si la organización existe
        if (organization.length === 0) {
            throw new Error('Organización no encontrada');
        }
    
        // Buscar el ID del miembro utilizando su email
        const [idUser] = await db.execute(`SELECT id FROM members WHERE email = ?`, [email]);
    
        // Validar si el miembro existe
        if (idUser.length === 0) {
            throw new Error('Miembro no encontrado');
        }
    
        const id = idUser[0].id; // Obtenemos el ID del miembro
    
        // Construir la consulta de actualización
        let query = `UPDATE members SET country = ?, organization_id = ?`;
        const params = [country, orgId]; // Parámetros obligatorios
    
        // Verificar si el nombre fue proporcionado
        if (name !== "") {
            query += `, fullname = ?`; // Agregamos el nombre a la consulta
            params.push(name); // Agregamos el nombre a los parámetros
        }
    
        // Verificar si la contraseña fue proporcionada
        if (password !== null && password !== "") {
            query += `, password = ?`; // Agregamos la contraseña a la consulta
            params.push(password); // Agregamos la contraseña a los parámetros
        }
    
        // Añadir la condición para el ID
        query += ` WHERE id = ?`;
        params.push(id); // Agregamos el ID al final de los parámetros
    
        // Ejecutar la consulta
        let result = await db.execute(query, params);
    
        if (result[0].affectedRows > 0) {
            return {
                success: true,
                data: {
                    organization_id: orgId,
                    organization_name: orgName
                }
            };
        } else {
            return {
                success: false
            };
        }
    }    
}

module.exports = Member;
