require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth - ${PORT}`);
});
