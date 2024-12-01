const express = require('express');
const ContentController = require('../controllers/contentController');

const router = express.Router();

router.get('/getAllCourses', ContentController.getAllCourses);
router.get('/getRecomendedCourses', ContentController.getRecomendedCourses);
router.post('/create', ContentController.createCourse);
router.put('/update/:id', ContentController.updateCourse);
router.delete('/delete/:id', ContentController.deleteCourse);
router.get('/getCourse/:id', ContentController.getCourse);

router.get('/getCatalog', ContentController.getCatalog);
router.get('/getCategories', ContentController.getCategories);
router.get('/getModuleDetail/:id', ContentController.getModuleDetail);

router.put('/addNewContent', ContentController.addNewContent);
router.put('/addNewQuestion', ContentController.addNewQuestion);
router.put('/addNewModule', ContentController.addNewModule);

router.get('/getCoursesByOrganization/:id', ContentController.getCoursesByOrganization);


//deletes list
router.delete('/delete-module/:id', ContentController.deleteModule);
router.delete('/delete-section/:id', ContentController.deleteSection);
router.delete('/delete-question/:id', ContentController.deleteQuestion);
module.exports = router;
