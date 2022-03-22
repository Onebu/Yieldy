const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const checkAuth = require("../middleware/check-auth");


//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/device/ */

router.get('/', checkAuth, deviceController.grantAccess("readAny", "device"), deviceController.getAll);

router.post('/', checkAuth, deviceController.grantAccess("updateOwn", "device"), deviceController.create);

router.get('/me', checkAuth, deviceController.grantAccess("readOwn", "device"), deviceController.getMe);

router.get('/related', checkAuth, deviceController.getRelatedDevices);

router.get('/:deviceId', checkAuth, deviceController.grantAccess("readOwn", "device"), deviceController.getById);

router.delete('/:deviceId', checkAuth, deviceController.grantAccess("deleteOwn", "device"), deviceController.delete);


module.exports = router;