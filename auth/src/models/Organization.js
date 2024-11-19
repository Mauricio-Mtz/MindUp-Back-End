const db = require('../../config/db');
const jwt = require('jsonwebtoken');  // Importar jwt para generar el token
const secretKey = process.env.JWT_SECRET || 'mi_clave_secreta'; // Usar variable de entorno o clave por defecto

class Organization {
    static async create(email, password, name, typeRegister) {
        console.log(name)
        console.log(typeRegister)
        let query;
        let params;
        
        if (typeRegister === 'native') {
            query = `INSERT INTO organizations (email, password) VALUES (?, ?)`;
            params = [email, password];
        } else {
            query = `INSERT INTO organizations (email, password, name) VALUES (?, ?, ?)`;
            params = [email, password, name];
        }
    
        // Ejecutar la inserción y obtener el ID de la organización insertada
        const [result] = await db.execute(query, params);
    
        // Obtener el ID de la nueva organización
        const insertId = result.insertId;
    
        // Realizar una consulta para obtener la organización recién creada
        const [rows] = await db.execute(`SELECT id, email, id as organization_id, name as organization_name FROM organizations WHERE id = ?`, [insertId]);
    
        // Devolver la organización recién creada (el primer resultado de la consulta)
        return rows[0];
    }    

    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT * FROM organizations WHERE email = ?`, [email]);
        return rows[0];
    }

    static async updateDetails(email, name, password, address, rfc, fiscalAddress, fiscalRegime) {
        // Primero, buscamos el ID de la organización utilizando su email
        const [organization] = await db.execute(`SELECT id, email, name FROM organizations WHERE email = ?`, [email]);
        
        // Validamos si la organización existe
        if (organization.length === 0) {
            throw new Error('Organización no encontrada');
        }
        
        // Obtenemos el ID y otros datos de la organización
        const { id, email: userEmail, name: userName } = organization[0];
    
        // Generar el token usando datos de la organización (ID y email)
        const token = jwt.sign(
            { id, email: userEmail, name: userName },
            secretKey,
            { expiresIn: '1h' } // El token expira en 1 hora
        );
    
        // Construimos la consulta de actualización
        let query = `UPDATE organizations SET address = ?, token = ?, rfc = ?, fiscal_address = ?, fiscal_regime = ?`;
        const params = [address, token, rfc, fiscalAddress, fiscalRegime];
    
        // Verificamos si el nombre fue proporcionado
        if (name !== "") {
            query += `, name = ?`;
            params.push(name);
        }
        // Verificamos si la contraseña fue proporcionada
        if (password !== null && password !== "") {
            query += `, password = ?`;
            params.push(password);
        }
    
        // Añadimos la condición para el ID
        query += ` WHERE id = ?`;
        params.push(id);
    
        // Ejecutamos la consulta
        const [result] = await db.execute(query, params);
    
        if (result.affectedRows > 0) {
            return {
                success: true,
                data: {
                    organization_id: id, // Devuelve solo el ID
                    organization_name: name || userName // Usa el nuevo nombre o el anterior
                }
            };
        } else {
            return {
                success: false
            };
        }
    }    
}

module.exports = Organization;
