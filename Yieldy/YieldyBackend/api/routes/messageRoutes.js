const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const checkAuth = require("../middleware/check-auth");

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/message/ */

router.get('/', checkAuth, messageController.grantAccess("readAny", "message"), messageController.getAll);

router.get('/me', checkAuth, messageController.grantAccess("readOwn", "message"), messageController.getMe);

router.get('/:messageId', checkAuth, messageController.grantAccess("readOwn", "message"), messageController.getById);

router.get('/system/:systemId',checkAuth, messageController.grantAccess("readOwn", "message"), messageController.getBySystem);

router.post('/', checkAuth, messageController.grantAccess("createOwn", "message"), messageController.create);

router.post('/reply', checkAuth, messageController.grantAccess("createOwn", "message"), messageController.reply);



module.exports = router;