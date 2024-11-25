const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Member = require('../models/Member');
const Organization = require('../models/Organization');

class UserController {
    static async findUserByEmail(email) {
        let user;
        let userType = '';
        
        // Buscar el usuario según su tipo
        user = await Student.findByEmail(email);
        if (user) userType = 'student';
    
        if (!user) {
            user = await Member.findByEmail(email);
            if (user) userType = 'member';
        }
    
        if (!user) {
            user = await Organization.findByEmail(email);
            if (user) userType = 'organization';
        }

        return { user, userType };
    }

    static async getUser(req, res) {
        const { email } = req.query;
        try {
            const { user, userType } = await UserController.findUserByEmail(email);

            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Usuario encontrado.',
                data: user,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Búsqueda de usuario fallida.',
                error: error.message,
            });
        }
    }

    static async updateEmail(req, res) {
        const { email, newEmail } = req.body;
        try {
            const { user, userType } = await UserController.findUserByEmail(email);

            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            switch (userType) {
                case 'student':
                    await Student.updateEmail(email, newEmail);
                    break;
                case 'member':
                    await Member.updateEmail(email, newEmail);
                    break;
                case 'organization':
                    await Organization.updateEmail(email, newEmail);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de usuario desconocido.',
                    });
            }

            return res.status(200).json({
                success: true,
                message: 'Email actualizado correctamente.',
                data: { ...user, email: newEmail },
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Actualización de email fallida.',
                error: error.message,
            });
        }
    }

    static async updatePassword(req, res) {
        const { email, newPassword } = req.body;
        try {
            const { user, userType } = await UserController.findUserByEmail(email);
    
            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }
    
            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            switch (userType) {
                case 'student':
                    await Student.updatePassword(email, hashedPassword);
                    break;
                case 'member':
                    await Member.updatePassword(email, hashedPassword);
                    break;
                case 'organization':
                    await Organization.updatePassword(email, hashedPassword);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de usuario desconocido.',
                    });
            }
    
            return res.status(200).json({
                success: true,
                message: 'Contraseña actualizada correctamente.',
            });
    
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Actualización de contraseña fallida.',
                error: error.message,
            });
        }
    }    

    static async updateInformation(req, res) {
        const { email, ...updatedData } = req.body;
        try {
            const { user, userType } = await UserController.findUserByEmail(email);

            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            switch (userType) {
                case 'student':
                    await Student.updateInformationByEmail(email, updatedData);
                    break;
                case 'member':
                    await Member.updateInformationByEmail(email, updatedData);
                    break;
                case 'organization':
                    await Organization.updateInformationByEmail(email, updatedData);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de usuario desconocido.',
                    });
            }

            return res.status(200).json({
                success: true,
                message: 'Información actualizada correctamente.',
                data: { ...user, ...updatedData },
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Actualización de usuario fallida.',
                error: error.message,
            });
        }
    }

    static async updatePreferences(req, res) {
        const { email, newPreferences } = req.body;
        console.log(email, newPreferences)
        try {
            const { user } = await UserController.findUserByEmail(email);

            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: 'Usuario no encontrado.',
                });
            }

            await Student.updatePreferencesByEmail(email, newPreferences);

            return res.status(200).json({
                success: true,
                message: 'Preferencias actualizadas correctamente.'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Actualización de usuario fallida.',
                error: error.message,
            });
        }
    }

    static async getMembers(req, res) {
        const { id } = req.params;
        try {
            const members = await Member.getByOrganization(id);

            if (!members) {
                return res.status(200).json({
                    success: false,
                    message: 'No hay miembros.',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Miembros encontrado.',
                data: members,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Búsqueda de miembros fallida.',
                error: error.message,
            });
        }
    }

    static async deleteUser(req, res) {
        const { email, type } = req.body;

        try {
            switch (type) {
                case 'student':
                    await Student.delete(email);
                    break;
                case 'member':
                    await Member.delete(email);
                    break;
                case 'organization':
                    await Organization.delete(email);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de usuario desconocido.',
                    });
            }

            return res.status(200).json({
                success: true,
                message: 'Usuario eliminado.'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Eliminacion de usuario fallida.',
                error: error.message,
            });
        }
    }
}

module.exports = UserController;
