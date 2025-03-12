const express = require('express');
const ManagerController = require('../controllers/managerController');

const router = express.Router();
router.get('/getCoursesByOrganization/:id', ManagerController.getCoursesByOrganization);
router.get('/getModuleDetail/:id', ManagerController.getModuleDetail);

//CRUD del contenido adicion y desactivacion del curso
router.post('/addNewCourse', ManagerController.addNewCourse);
router.put('/desactiveCourse', ManagerController.desactiveCourse);
//CRUD del contenido adicion de los modulos, secciones y quizzes
router.put('/addNewModule', ManagerController.addNewModule);
router.put('/addNewContent', ManagerController.addNewContent);
router.put('/addNewQuestion', ManagerController.addNewQuestion);
//CRUD del contenido eliminacion de los modulos, secciones y quizzes
router.delete('/delete-module/:id', ManagerController.deleteModule);
router.delete('/delete-section/:sectionId', ManagerController.deleteSection);
router.delete('/delete-question/:questionId', ManagerController.deleteQuestion);
module.exports = router;
