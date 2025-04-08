require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./src/routes/notificationRoutes');
const reminderRoutes = require('./src/routes/reminderRoutes');
const scheduler = require('./src/scheduler/scheduler');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/', notificationRoutes);
app.use('/reminders', reminderRoutes);

// Iniciar el planificador de tareas
scheduler.initScheduler();

const PORT = process.env.NOTIFICATIONS_PORT || 3005;
app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});