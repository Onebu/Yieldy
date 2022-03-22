const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkAuth = require("../middleware/check-auth");
var upload = require('../configs/multerConfig');

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/user/ */

router.post('/create', checkAuth, userController.grantAccess('createOwn', 'company'), userController.createUser);

router.post('/login', userController.login);

router.get('/confirmation/:token', userController.confirmationPost);

router.post('/resend', userController.resendTokenPost);

router.post('/refreshToken', userController.refreshToken);

router.post('/deleteToken', checkAuth, userController.grantAccess('updateOwn', 'profile'), userController.deleteToken);

router.patch("/profileImage", checkAuth, upload.any(), userController.grantAccess('updateOwn', 'profile'), userController.addProfile);

router.patch("/:userId", checkAuth, userController.grantAccess('updateOwn', 'profile'),  userController.update);

router.get('/', checkAuth, userController.grantAccess('readAny', 'user'), userController.getAll);

router.get('/me', checkAuth,userController.grantAccess('readOwn', 'user'),  userController.getMe);

router.get('/:userId', checkAuth, userController.grantAccess('readAny', 'profile'), userController.getById);

router.delete('/:userId', checkAuth, userController.grantAccess('updateOwn', 'user'), userController.delete);

module.exports = router;