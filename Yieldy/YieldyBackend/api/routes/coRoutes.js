const express = require('express');
const router = express.Router();
const coController = require('../controllers/coController');
const checkAuth = require("../middleware/check-auth");
const upload = require('../configs/multerConfig');


//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/co/ */

router.post('/signup', coController.signup);

router.post('/login', coController.login);

router.get('/confirmation/:token', coController.confirmationPost);

router.post('/resend', coController.resendTokenPost);

router.post('/refreshToken', coController.refreshToken);

router.post('/deleteToken', checkAuth, coController.grantAccess('updateOwn', 'profile'), coController.deleteToken);

router.patch("/profileImage", checkAuth, upload.any(), coController.grantAccess('updateOwn', 'profile'), coController.addProfile);

router.get('/', checkAuth, coController.grantAccess('readAny', 'profile'), coController.getAll);

router.get('/search/:name',  checkAuth, coController.grantAccess('readAny', 'profile'),coController.searchByName);

router.get('/:userId', checkAuth,coController.grantAccess('readAny', 'profile'),  coController.getById);

router.patch("/:userId", checkAuth, coController.grantAccess('updateOwn', 'profile'), checkAuth, coController.update);

router.delete('/:userId', checkAuth, checkAuth, coController.grantAccess('deleteAny', 'profile'), coController.delete);

module.exports = router;