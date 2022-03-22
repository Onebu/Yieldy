const express = require('express');
const router = express.Router();
//IMPORT CONTROLLER
var imageController = require('../controllers/imageController');
var upload = require('../configs/multerConfig');

//WHEN A POST IS MADE TO THE ROUTE, IT WILL ENTER THE IMAGE CONTROLLER.
//.any() ACCEPTS ALL FILES THAT COMES OVER THE WIRE.
router.post('/addImage', upload.any(), imageController.createApp);
module.exports = router