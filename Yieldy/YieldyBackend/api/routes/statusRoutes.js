const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const checkAuth = require("../middleware/check-auth");

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/status/ */

router.post('/',  statusController.create);
router.get('/audit/:statusCode/:period?/:size?',checkAuth, statusController.grantAccess("readOwn", "status"), statusController.getAuditLogDefault);
router.get('/file/:statusCode/:period?',checkAuth, statusController.grantAccess("readOwn", "status"), statusController.getFileLogDefault);
router.get('/heart/:statusCode/:period?',checkAuth, statusController.grantAccess("readOwn", "status"), statusController.getHeartLogDefault);
router.get('/packet/:statusCode/:period?',checkAuth, statusController.grantAccess("readOwn", "status"), statusController.getPacketLogDefault);
router.get('/metric/:statusCode/:period?/:size?',checkAuth, statusController.grantAccess("readOwn", "status"), statusController.getMetricLogDefault);
router.get('/winlog/:statusCode/:period?',checkAuth, statusController.grantAccess("readOwn", "status"), statusController.getWinLogDefault);
router.get('/:statusCode', checkAuth, statusController.grantAccess("readOwn", "status") ,statusController.getByStatusDefault);
router.get('/day/:statusCode', checkAuth, statusController.grantAccess("readOwn", "status") ,statusController.getOneDay);
router.get('/week/:statusCode', checkAuth, statusController.grantAccess("readOwn", "status") ,statusController.getOneWeek);
router.get('/month/:statusCode', checkAuth, statusController.grantAccess("readOwn", "status") ,statusController.getOneMonth);

module.exports = router;