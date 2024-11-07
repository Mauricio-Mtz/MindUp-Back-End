require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./src/routes/notificationRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', notificationRoutes);

const PORT = process.env.NOTIFICATION_PORT;
app.listen(PORT, () => {
    console.log(`Notification - ${PORT}`);
});
