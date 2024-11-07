require('dotenv').config();
const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./src/routes/paymentRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', paymentRoutes);

const PORT = process.env.PAYMENTS_PORT;
app.listen(PORT, () => {
    console.log(`Payments - ${PORT}`);
});
