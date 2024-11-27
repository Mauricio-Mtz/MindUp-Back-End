const crypto = require('crypto');

class MatrixEncryptionController {
    // Método para generar una matriz de claves a partir de una contraseña
    static generateKeyMatrix(password) {
        // Convertir cada carácter a su código ASCII
        const asciiChars = password.split('').map(char => char.charCodeAt(0));
        
        // Calcular dimensiones de la matriz (raíz cuadrada más cercana)
        const matrixSize = Math.ceil(Math.sqrt(asciiChars.length));
        
        // Rellenar la matriz con códigos ASCII, completando con valores aleatorios
        const matrix = [];
        let charIndex = 0;

        for (let i = 0; i < matrixSize; i++) {
            const row = [];
            for (let j = 0; j < matrixSize; j++) {
                if (charIndex < asciiChars.length) {
                    row.push(asciiChars[charIndex]);
                    charIndex++;
                } else {
                    // Generar un valor aleatorio si no hay más caracteres
                    row.push(Math.floor(Math.random() * 256));
                }
            }
            matrix.push(row);
        }

        return matrix;
    }

    // Método de encriptación usando transformación matricial
    static encrypt(password, salt = '') {
        const keyMatrix = this.generateKeyMatrix(password + salt);
        
        // Realizar transformaciones matriciales
        const transformedMatrix = keyMatrix.map(row => 
            row.map(value => 
                // Aplicar una transformación matemática compleja
                (value * 7 + 11) % 256
            )
        );

        // Convertir matriz a cadena hexadecimal
        const encryptedHex = transformedMatrix
            .flat()
            .map(num => num.toString(16).padStart(2, '0'))
            .join('');

        return encryptedHex;
    }

    // Método de verificación de contraseña
    static verify(inputPassword, storedEncryptedPassword, salt = '') {
        const computedHash = this.encrypt(inputPassword, salt);
        return computedHash === storedEncryptedPassword;
    }

    // Generar un salt aleatorio para mayor seguridad
    static generateSalt(length = 16) {
        return crypto.randomBytes(length).toString('hex');
    }
}

module.exports = MatrixEncryptionController;