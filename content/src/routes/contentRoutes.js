const express = require('express');
const CatalogController = require('../controllers/catalogController');
const ManagerController = require('../controllers/managerController');

const router = express.Router();
// MANAGER ROUTES
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

// CATALOG ROUTES
router.get('/getAllCourses', CatalogController.getAllCourses);
router.get('/getRecomendedCourses', CatalogController.getRecomendedCourses);
router.get('/getCourse/:id', CatalogController.getCourse);

router.get('/getCatalog', CatalogController.getCatalog);
router.get('/getModuleDetailCatalog/:id', CatalogController.getModuleDetailCatalog);
router.get('/getCategories', CatalogController.getCategories);

// router.get('/getCoursesByOrganization/:id', CatalogController.getCoursesByOrganization);
// router.get('/getModuleDetail/:id', CatalogController.getModuleDetail);
module.exports = router;
