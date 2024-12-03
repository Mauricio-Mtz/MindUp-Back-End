const express = require('express');
const ContentController = require('../controllers/contentController');

const router = express.Router();

router.get('/getAllCourses', ContentController.getAllCourses);
router.get('/getRecomendedCourses', ContentController.getRecomendedCourses);
router.get('/getCourse/:id', ContentController.getCourse);

router.get('/getCatalog', ContentController.getCatalog);
router.get('/getModuleDetailCatalog/:id', ContentController.getModuleDetailCatalog);
router.get('/getCategories', ContentController.getCategories);

router.get('/getCoursesByOrganization/:id', ContentController.getCoursesByOrganization);
router.get('/getModuleDetail/:id', ContentController.getModuleDetail);

//CRUD del contenido adicion y desactivacion del curso
router.post('/addNewCourse', ContentController.addNewCourse);
router.put('/desactiveCourse', ContentController.desactiveCourse);
//CRUD del contenido adicion de los modulos, secciones y quizzes
router.put('/addNewModule', ContentController.addNewModule);
router.put('/addNewContent', ContentController.addNewContent);
router.put('/addNewQuestion', ContentController.addNewQuestion);
//CRUD del contenido eliminacion de los modulos, secciones y quizzes
router.delete('/delete-module/:id', ContentController.deleteModule);
router.delete('/delete-section/:sectionId', ContentController.deleteSection);
router.delete('/delete-question/:questionId', ContentController.deleteQuestion);
module.exports = router;
