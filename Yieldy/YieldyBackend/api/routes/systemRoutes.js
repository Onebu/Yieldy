const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const checkAuth = require("../middleware/check-auth");

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/status/ */

router.get('/', checkAuth, systemController.grantAccess("readAny", "system"), systemController.getAll);

router.post("/", checkAuth, systemController.grantAccess("createOwn", "system"), systemController.create);

router.get('/me', checkAuth, systemController.grantAccess("readOwn", "system"), systemController.getMe);

router.get('/:systemId', checkAuth, systemController.getById); //Access control added in controller function

router.delete("/:systemId", checkAuth, systemController.grantAccess("deleteOwn", "system"), systemController.delete);

router.patch('/addadmin/:systemId', checkAuth, systemController.grantAccess("updateOwn", "system"), systemController.assignAdmin);

router.patch('/removeadmin/:systemId', checkAuth, systemController.grantAccess("updateOwn", "system"), systemController.removeAdmin);

router.patch('/addtechnician/:systemId', checkAuth, systemController.grantAccess("updateOwn", "system"), systemController.assignTechnician);

router.patch('/removetechnician/:systemId', checkAuth, systemController.grantAccess("updateOwn", "system"), systemController.removeTechnician);

router.patch('/addpushnode/', checkAuth, systemController.addPushNode);


module.exports = router;