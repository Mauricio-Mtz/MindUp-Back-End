const express = require('express');
const CatalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/getAllCourses', CatalogController.getAllCourses);
router.get('/getRecomendedCourses', CatalogController.getRecomendedCourses);
router.get('/getCourse/:id', CatalogController.getCourse);

router.get('/getCatalog', CatalogController.getCatalog);
router.get('/getModuleDetailCatalog/:id', CatalogController.getModuleDetailCatalog);
router.get('/getCategories', CatalogController.getCategories);

router.get('/getCoursesByOrganization/:id', CatalogController.getCoursesByOrganization);
router.get('/getModuleDetail/:id', CatalogController.getModuleDetail);
module.exports = router;
