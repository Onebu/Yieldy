const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const checkAuth = require("../middleware/check-auth");

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/task/ */

router.get('/', checkAuth, taskController.grantAccess("readAny", "task"), taskController.getAll);

router.post('/', checkAuth, taskController.grantAccess("createOwn", "task"),taskController.create);

router.get('/me', checkAuth, taskController.grantAccess("readOwn", "task"), taskController.getMe);

router.get('/:taskId', checkAuth, taskController.getById);

router.get('/system/:systemId',checkAuth, taskController.getBySystem);

router.delete('/:taskId', checkAuth, taskController.grantAccess("deleteOwn", "task"), taskController.delete);

router.patch('/:taskId', checkAuth, taskController.grantAccess("updateOwn", "task"), taskController.update);

router.patch('/assign/:taskId', checkAuth, taskController.grantAccess("updateOwn", "task"), taskController.assign);

router.patch('/revoke/:taskId', checkAuth, taskController.grantAccess("updateOwn", "task"), taskController.revoke);





module.exports = router;