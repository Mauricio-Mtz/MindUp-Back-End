const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

router.get('/getUser', UserController.getUser);
router.put('/updateEmail', UserController.updateEmail);
router.put('/updatePassword', UserController.updatePassword);
router.put('/updateInformation', UserController.updateInformation);

module.exports = router;
