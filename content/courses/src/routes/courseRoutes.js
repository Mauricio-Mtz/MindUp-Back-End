const express = require('express');
const CourseController = require('../controllers/courseController');

const router = express.Router();

router.get('/getAllCourses', CourseController.getAllCourses);
router.post('/create', CourseController.createCourse);
router.put('/update/:id', CourseController.updateCourse);
router.delete('/delete/:id', CourseController.deleteCourse);

module.exports = router;
