require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./src/routes/adminRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', adminRoutes);

const PORT = process.env.ADMIN_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Admin - ${PORT}`);
});
