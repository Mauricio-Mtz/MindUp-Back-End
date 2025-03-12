require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true
})
.then(() => console.info('Conexión MongoDB lista'))
.catch(error => console.error('Error de conexión MongoDB:', error));

module.exports = mongoose.connection;