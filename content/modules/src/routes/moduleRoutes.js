const express = require('express');
const ModuleController = require('../controllers/moduleController');

const router = express.Router();

router.get('/getModulesForCourses/:id', ModuleController.getModulesForCourses);
// router.post('/create', CourseController.createCourse);
// router.put('/update/:id', CourseController.updateCourse);
// router.delete('/delete/:id', CourseController.deleteCourse);
// router.get('/getCourse/:id', CourseController.getCourse);

module.exports = router;
