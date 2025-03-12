const db = require('../../config/db');
const ModuleContent = require('./mongodb/moduleSchema');

class Module {
    // Las primeras dos funciones se mantienen igual ya que funcionan correctamente
    static async getModuleDetail(courseId) {
        try {
            const [mysqlModules] = await db.query(`
                SELECT id, course_id, name, level
                FROM modules
                WHERE course_id = ?
            `, [courseId]);

            if (!mysqlModules.length) {
                return [];
            }

            const moduleIds = mysqlModules.map(module => module.id);
            const mongoModules = await ModuleContent.find({
                module_id: { $in: moduleIds }
            });

            const mongoModulesMap = mongoModules.reduce((acc, module) => {
                acc[module.module_id] = module;
                return acc;
            }, {});

            const combinedModules = mysqlModules.map(mysqlModule => {
                const mongoData = mongoModulesMap[mysqlModule.id] || {};
                
                return {
                    id: mysqlModule.id,
                    course_id: mysqlModule.course_id,
                    name: mysqlModule.name,
                    level: mysqlModule.level,
                    content: mongoData.content || [],
                    quiz: mongoData.quiz || {
                        questions: [],
                        passing_score: 0
                    }
                };
            });

            return combinedModules;
        } catch (error) {
            console.error('Error al obtener módulos:', error);
            throw error;
        }
    }

    static async getModuleDetailCatalog(id) {
        try {
            const [mysqlModules] = await db.query(`
                SELECT id, course_id, name, level
                FROM modules
                WHERE id = ?
            `, [id]);

            if (!mysqlModules.length) {
                return [];
            }

            const moduleIds = mysqlModules.map(module => module.id);
            const mongoModules = await ModuleContent.find({
                module_id: { $in: moduleIds }
            });

            const mongoModulesMap = mongoModules.reduce((acc, module) => {
                acc[module.module_id] = module;
                return acc;
            }, {});

            const combinedModules = mysqlModules.map(mysqlModule => {
                const mongoData = mongoModulesMap[mysqlModule.id] || {};
                
                return {
                    id: mysqlModule.id,
                    course_id: mysqlModule.course_id,
                    name: mysqlModule.name,
                    level: mysqlModule.level,
                    content: mongoData.content || [],
                    quiz: mongoData.quiz || {
                        questions: [],
                        passing_score: 0
                    }
                };
            });

            return combinedModules;
        } catch (error) {
            console.error('Error al obtener módulos:', error);
            throw error;
        }
    }

    // Crear nuevo módulo
    static async addNewModule(name, level, courseId) {
        try {
            // 1. Crear el módulo en MySQL
            const [result] = await db.query(
                `INSERT INTO modules (name, level, course_id) VALUES (?, ?, ?)`,
                [name, level, courseId]
            );

            // 2. Crear documento inicial en MongoDB
            await ModuleContent.create({
                module_id: result.insertId,
                content: [],
                quiz: {
                    questions: [],
                    passing_score: 0
                }
            });

            return result.insertId;
        } catch (error) {
            console.error('Error al crear módulo:', error);
            throw error;
        }
    }

    // Agregar nuevo contenido
    static async addNewContent(content, id, courseId) {
        try {
            // 1. Verificar que el módulo existe en MySQL
            const [mysqlModule] = await db.query(
                'SELECT id FROM modules WHERE id = ? AND course_id = ?',
                [id, courseId]
            );

            if (!mysqlModule.length) {
                throw new Error('Módulo no encontrado');
            }

            // 2. Parsear el contenido para validar
            const parsedContent = JSON.parse(content);

            // 3. Actualizar o crear documento en MongoDB
            const result = await ModuleContent.findOneAndUpdate(
                { module_id: id },
                { content: parsedContent },
                { upsert: true, new: true }
            );

            return result ? 1 : 0;
        } catch (error) {
            console.error('Error al agregar contenido:', error);
            throw error;
        }
    }

    // Agregar nuevo quiz
    static async addNewQuestion(quiz, id, courseId) {
        try {
            // 1. Verificar que el módulo existe en MySQL
            const [mysqlModule] = await db.query(
                'SELECT id FROM modules WHERE id = ? AND course_id = ?',
                [id, courseId]
            );

            if (!mysqlModule.length) {
                throw new Error('Módulo no encontrado');
            }

            // 2. Parsear el quiz para validar
            const parsedQuiz = JSON.parse(quiz);

            // 3. Actualizar o crear documento en MongoDB
            const result = await ModuleContent.findOneAndUpdate(
                { module_id: id },
                { quiz: parsedQuiz },
                { upsert: true, new: true }
            );

            return result ? 1 : 0;
        } catch (error) {
            console.error('Error al agregar quiz:', error);
            throw error;
        }
    }

    // Eliminar módulo
    static async deleteModule(id) {
        try {
            // 1. Eliminar el módulo de MySQL
            const [mysqlResult] = await db.query('DELETE FROM modules WHERE id = ?', [id]);

            // 2. Eliminar el contenido asociado en MongoDB
            await ModuleContent.deleteOne({ module_id: id });

            return mysqlResult.affectedRows;
        } catch (error) {
            console.error('Error al eliminar módulo:', error);
            throw error;
        }
    }

    // Eliminar sección de contenido
    static async deleteSection(sectionId, moduleId) {
        try {
            // 1. Obtener el documento de MongoDB
            const moduleContent = await ModuleContent.findOne({ module_id: moduleId });
            
            if (!moduleContent || !moduleContent.content) {
                throw new Error("No se encontró el módulo o el contenido está vacío");
            }

            // 2. Eliminar la sección del array de contenido
            moduleContent.content.splice(sectionId, 1);

            // 3. Guardar los cambios
            await moduleContent.save();

            return 1;
        } catch (error) {
            console.error("Error al eliminar la sección:", error.message);
            throw error;
        }
    }

    // Eliminar pregunta del quiz
    static async deleteQuestion(questionId, moduleId) {
        try {
            // 1. Obtener el documento de MongoDB
            const moduleContent = await ModuleContent.findOne({ module_id: moduleId });
            
            if (!moduleContent || !moduleContent.quiz || !moduleContent.quiz.questions) {
                throw new Error("No se encontró el módulo o el quiz está vacío");
            }

            // 2. Eliminar la pregunta del array de preguntas
            moduleContent.quiz.questions.splice(questionId, 1);

            // 3. Guardar los cambios
            await moduleContent.save();

            return 1;
        } catch (error) {
            console.error("Error al eliminar la pregunta:", error.message);
            throw error;
        }
    }
}

module.exports = Module;