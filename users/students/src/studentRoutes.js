const express = require('express');
const StudentController = require('./studentController');

const router = express.Router();
const studentController = new StudentController();

router.get('/read', studentController.getAllStudents);
router.post('/create', studentController.createStudent);
router.put('/update/:id', studentController.updateStudent);
router.delete('/delete/:id', studentController.deleteStudent);

module.exports = router;