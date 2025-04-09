const multer = require('multer');
const path = require('path');
const FTPClient = require('ftp'); // Librería para FTP

class ContentService {

    // Configuración de multer para guardar archivos en memoria
    static upload() {
        const storage = multer.memoryStorage(); // Usamos `memoryStorage` para almacenar el archivo en memoria

        return multer({
            storage,
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF).'), false);
                }
            }
        }).single('img'); // El campo de la imagen en el formulario (por ejemplo, 'img')
    }

    // Método para subir la imagen al servidor remoto usando FTP
    static async uploadToLocalServer(file) {
        return new Promise((resolve, reject) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`; // Nombre único para evitar conflictos
            const extension = path.extname(file.originalname);
            const localPath = `./images/courses/${uniqueSuffix}${extension}`; // Ruta local donde se almacenará la imagen

            require('fs').writeFile(localPath, file.buffer, (err) => {
                if (err) return reject(err);
                
                resolve(localPath); // Retornamos solo la ruta local
            });
        });
    }
}

module.exports = ContentService;
