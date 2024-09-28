// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('./studentController');

router.get('/read', studentController.getAllStudents);
router.post('/create', studentController.createStudent);
router.put('/update/:id', studentController.updateStudent);
router.delete('/delete/:id', studentController.deleteStudent);

module.exports = router;