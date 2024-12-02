const express = require('express');
const UserController = require('../controllers/userController');
const UserCoursesController = require('../controllers/userCoursesController');

const router = express.Router();

router.get('/getUser', UserController.getUser);
router.put('/updateEmail', UserController.updateEmail);
router.put('/updatePassword', UserController.updatePassword);
router.put('/updateInformation', UserController.updateInformation);
router.put('/updatePreferences', UserController.updatePreferences);

router.post('/enrollCourse', UserCoursesController.enrollCourse);
router.post('/registerQuizzResult', UserCoursesController.registerQuizzResult);
router.get('/getCoursesByStudent', UserCoursesController.getCoursesByStudent);
router.post('/getStudentProgress', UserCoursesController.getStudentProgress);

router.get('/getMembers/:id', UserController.getMembers);
router.post('/deleteUser', UserController.deleteUser);

module.exports = router;
