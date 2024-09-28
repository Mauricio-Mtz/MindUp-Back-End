// routes/CourseRoutes.js
const express = require('express');
const CourseController = require('./CourseController');
const router = express.Router();

const courseController = new CourseController();

// Rutas para los cursos
router.get('/read', (req, res) => courseController.getAllCourses(req, res));
router.post('/create', (req, res) => courseController.createCourse(req, res));
router.put('/update/:id', (req, res) => courseController.updateCourse(req, res));
router.delete('/delete/:id', (req, res) => courseController.deleteCourse(req, res));

module.exports = router;
