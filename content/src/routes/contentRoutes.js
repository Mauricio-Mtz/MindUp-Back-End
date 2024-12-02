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

router.post('/addNewCourse', ContentController.addNewCourse);
router.put('/addNewContent', ContentController.addNewContent);
router.put('/addNewQuestion', ContentController.addNewQuestion);
router.put('/addNewModule', ContentController.addNewModule);
router.put('/desactiveCourse', ContentController.desactiveCourse);

router.delete('/delete-module/:id', ContentController.deleteModule);
router.delete('/delete-section/:id', ContentController.deleteSection);
router.delete('/delete-question/:id', ContentController.deleteQuestion);
module.exports = router;
