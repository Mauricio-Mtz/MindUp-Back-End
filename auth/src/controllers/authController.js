const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Member = require('../models/Member');
const Organization = require('../models/Organization');

class AuthController {
    static async login(req, res) {
        const { type, email, password } = req.body;
        try {
            let user;
            let typeUser = '';
    
            // Buscar el usuario según su tipo
            user = await Student.findByEmail(email);
            if (user) typeUser = 'student';
    
            if (!user) {
                user = await Member.findByEmail(email);
                if (user) typeUser = 'member';
            }
    
            if (!user) {
                user = await Organization.findByEmail(email);
                if (user) typeUser = 'organization';
            }
    
            // Si no se encuentra el usuario (correo no existe)
            if (!user) {
                return res.status(200).json({
                    success: false,
                    emailExists: false,  // El correo no existe
                    message: 'Correo no encontrado',
                });
            }
    
            // El correo existe pero la contraseña puede ser incorrecta
            let passwordCorrect = false;
    
            // Validar contraseña si no es inicio con Google
            if (user.password && type !== 'google') {
                const isMatch = await bcrypt.compare(password, user.password);
                passwordCorrect = isMatch;
    
                // Si la contraseña no es correcta
                if (!isMatch) {
                    return res.status(200).json({
                        success: false,
                        emailExists: true,  // El correo existe
                        passwordCorrect: false,  // La contraseña es incorrecta
                        message: 'Contraseña incorrecta',
                    });
                }
            }
    
            // Generar el token JWT solo si las credenciales son correctas
            const token = jwt.sign(
                { id: user.id, email: user.email, type: typeUser },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Agregar el typeUser al objeto de usuario
            user = { ...user, type: typeUser };
    
            // Enviar la respuesta con el token y el usuario
            return res.status(200).json({
                success: true,
                emailExists: true,  // El correo existe
                passwordCorrect: true,  // La contraseña es correcta
                data: user,
                message: 'Inicio de sesión exitoso',
                // token,  // Incluir el token en la respuesta
            });
    
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Inicio de sesión fallido',
                error: error.message,
            });
        }
    }    

    static async register(req, res) {
        const { typeRegister, typeUser, name, email, password } = req.body;
    
        try {
            // Verificar si el email ya existe en alguna de las tablas
            let existingUser = await Student.findByEmail(email);
            if (existingUser) {
                return res.status(200).json({
                    success: false,
                    message: 'Este correo ya está registrado como estudiante',
                });
            }
    
            existingUser = await Member.findByEmail(email);
            if (existingUser) {
                return res.status(200).json({
                    success: false,
                    message: 'Este correo ya está registrado como Miembro',
                });
            }
    
            existingUser = await Organization.findByEmail(email);
            if (existingUser) {
                return res.status(200).json({
                    success: false,
                    message: 'Este correo ya está registrado como Organización',
                });
            }
    
            // Solo hashear la contraseña si el tipo de registro es 'native'
            const hashedPassword = typeRegister === 'native' ? await bcrypt.hash(password, 10) : null;
            let user;
    
            // Crear el usuario según el tipoUser proporcionado
            switch (typeUser) {
                case 'student':
                    user = await Student.create(email, hashedPassword, name, typeRegister);
                    break;
                case 'member':
                    user = await Member.create(email, hashedPassword, name, typeRegister);
                    break;
                case 'organization':
                    user = await Organization.create(email, hashedPassword, name, typeRegister);
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'El tipo de usuario no es valido' });
            }

            // Enviar correo de bienvenida por el registro
            await fetch('http://localhost:3000/notifications/createNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject: "¡Bienvenido a MindUp!",
                    type: "welcome",
                    data: {
                        name: name
                    }
                })
            }); 
    
            // Agregar el typeUser al objeto de usuario
            user = { ...user, type: typeUser };
    
            // Enviar la respuesta con el usuario creado
            return res.status(201).json({
                success: true,
                data: user,
                message: 'Registro exitoso',
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Registro fallido',
                error: error.message,
            });
        }
    }
    

    static async completeRegister(req, res) {
        const { typeUser, email, password, name, birthdate, country, grade, address, token, rfc, fiscalAddress, fiscalRegime, preferences } = req.body;
        let result;

        try {
            const hashedPassword = password && password !== "" ? await bcrypt.hash(password, 10) : null;

            // Actualizar datos del usuario según el tipo
            switch (typeUser) {
                case 'student':
                    result = await Student.updateDetails(email, name, hashedPassword, birthdate, country, grade, preferences);
                    break;
                case 'member':
                    result = await Member.updateDetails(email, name, hashedPassword, country, token);
                    break;
                case 'organization':
                    result = await Organization.updateDetails(email, name, hashedPassword, address, rfc, fiscalAddress, fiscalRegime);
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'Tipo de usuario invalido' });
            }
            console.log(result)

            // Enviar respuesta con la actualización exitosa
            if (result.success) {
                if (typeUser === 'member' || typeUser === 'organization') {
                    return res.status(200).json({
                        success: true,
                        message: 'Detalles actualizados correctamente',
                        type: typeUser,
                        data: result.data,
                    });
                } else {
                    return res.status(200).json({
                        success: true,
                        message: 'Detalles actualizados correctamente',
                        type: typeUser,
                    });
                }
            } else {
                return res.status(200).json({
                    success: false,
                    message: 'No se pudieron actualizar los datos',
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al agregar los detalles del registro',
                error: error.message,
            });
        }
    }
}

module.exports = AuthController;
