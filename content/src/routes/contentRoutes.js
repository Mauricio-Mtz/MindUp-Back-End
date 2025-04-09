const express = require('express');
const CatalogController = require('../controllers/catalogController');
const ManagerController = require('../controllers/managerController');
const CommentController = require('../controllers/commentController');

const router = express.Router();

router.get('/getAllCourses', ContentController.getAllCourses);
router.get('/getRecomendedCourses', ContentController.getRecomendedCourses);
router.get('/getCourse/:id', ContentController.getCourse);

router.get('/getCatalog', ContentController.getCatalog);
router.get('/getModuleDetailCatalog/:id', ContentController.getModuleDetailCatalog);
router.get('/getCategories', ContentController.getCategories);

router.get('/getCoursesByOrganization/:id', ContentController.getCoursesByOrganization);
router.get('/getModuleDetail/:id', ContentController.getModuleDetail);

router.post('/addNewCourse', ContentController.addNewCourse);
router.put('/addNewContent', ContentController.addNewContent);
router.put('/addNewQuestion', ContentController.addNewQuestion);
router.put('/addNewModule', ContentController.addNewModule);
router.put('/desactiveCourse', ContentController.desactiveCourse);

router.get('/getCatalog', CatalogController.getCatalog);
router.get('/getModuleDetailCatalog/:id', CatalogController.getModuleDetailCatalog);
router.get('/getCategories', CatalogController.getCategories);

// Rutas de comentarios
router.get('/courses/:courseId/comments', CommentController.getComments);
router.post('/courses/:courseId/comments', CommentController.addComment);
router.get('/courses/:courseId/rating', CommentController.getRatingInfo);


// router.get('/getCoursesByOrganization/:id', CatalogController.getCoursesByOrganization);
// router.get('/getModuleDetail/:id', CatalogController.getModuleDetail);
module.exports = router;
