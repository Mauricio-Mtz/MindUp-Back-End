const express = require('express');
const UserController = require('../controllers/userController');
const UserCoursesController = require('../controllers/userCoursesController');

const router = express.Router();

router.get('/getUser', UserController.getUser);
router.put('/updateEmail', UserController.updateEmail);
router.put('/updatePassword', UserController.updatePassword);
router.put('/updateInformation', UserController.updateInformation);

router.post('/enrollCourse', UserCoursesController.enrollCourse);
router.get('/getCoursesByStudent', UserCoursesController.getCoursesByStudent);

module.exports = router;
