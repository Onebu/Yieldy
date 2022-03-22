const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const checkAuth = require("../middleware/check-auth");

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/config/ */

router.get('/', checkAuth, configController.grantAccess("readAny", "config"), configController.getAll);

router.get('/me', checkAuth, configController.grantAccess("readOwn", "config"), configController.getMe);

router.get('/:configId', checkAuth, configController.grantAccess("readAny", "config"), configController.getById);

router.patch('/:configId', checkAuth, configController.grantAccess("updateOwn", "config"), configController.update);



module.exports = router;