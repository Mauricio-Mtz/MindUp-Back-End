require('dotenv').config();
const express = require('express');
const cors = require('cors');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', subscriptionRoutes);

const PORT = process.env.SUBSCRIPTION_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Subscription - ${PORT}`);
});
