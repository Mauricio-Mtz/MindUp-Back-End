const db = require('../../config/db');

class Student {
    static async create(email, password, name, typeRegister) {
        let query;
        let params;
        
        if (typeRegister === 'google') {
            query = `INSERT INTO students (email, fullname) VALUES (?, ?)`;
            params = [email, name];
        } else {
            query = `INSERT INTO students (email, password) VALUES (?, ?)`;
            params = [email, password];
        }
    
        // Ejecutar la inserción y obtener el ID del usuario insertado
        const [result] = await db.execute(query, params);
    
        // Obtener el ID del nuevo usuario
        const insertId = result.insertId;
    
        // Realizar una consulta para obtener el usuario recién creado
        const [rows] = await db.execute(`SELECT * FROM students WHERE id = ?`, [insertId]);
        // Devolver el usuario recién creado (el primer resultado de la consulta)
        return rows[0];
    }    

    static async findByEmail(email) {
        const [rows] = await db.execute(`SELECT * FROM students WHERE email = ?`, [email]);
        return rows[0];
    }

    static async updateDetails(email, name, password, birthdate, country, grade) {
        console.log("Password: ", password)
        // Primero, buscamos el ID del estudiante utilizando su email
        const [idUser] = await db.execute(`SELECT id FROM students WHERE email = ?`, [email]);
        
        // Validamos si el estudiante existe
        if (idUser.length === 0) {
            throw new Error('Estudiante no encontrado');
        }
    
        const id = idUser[0].id; // Obtenemos el ID del estudiante
    
        // Construimos la consulta de actualización
        let query = `UPDATE students SET birthdate = ?, country = ?, grade = ?`;
        const params = [birthdate, country, grade]; // Parametros obligatorios
    
        // Verificamos si el nombre fue proporcionado
        if (name !== "") {
            query += `, fullname = ?`; // Agregamos el nombre a la consulta
            params.push(name); // Agregamos el nombre a los parámetros
        }
    
        // Verificamos si la contraseña fue proporcionada (no es null ni "")
        if (password !== null && password !== "") {
            query += `, password = ?`; // Agregamos la contraseña a la consulta
            params.push(password); // Agregamos la contraseña a los parámetros
        }
    
        // Añadimos la condición para el ID
        query += ` WHERE id = ?`;
        params.push(id); // Agregamos el ID al final de los parámetros
    
        // Ejecutamos la consulta
        await db.execute(query, params);
    
        // Obtener los datos actualizados
        const [rows] = await db.execute(`SELECT * FROM students WHERE email = ?`, [email]); 
        return rows[0];
    }    
}

module.exports = Student;
