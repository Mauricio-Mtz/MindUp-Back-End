require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', userRoutes);

const PORT = process.env.USERS_PORT || 3005;
app.listen(PORT, () => {
    console.log(`Users - ${PORT}`);
});
