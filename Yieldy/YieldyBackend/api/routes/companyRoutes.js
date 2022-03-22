const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const checkAuth = require("../middleware/check-auth");

//ALL THE REQUEST SHOULD BE CALLED AT 
/* BASE_URL/company/ */

router.get('/', checkAuth,companyController.grantAccess("readAny","company"),companyController.getAll);

router.post('/',checkAuth,companyController.grantAccess("createOwn","company"),companyController.registerCompany);

router.get('/me',checkAuth,companyController.grantAccess("readOwn","company"),companyController.getMe);

router.get('/search/:name',checkAuth,companyController.grantAccess("readAny","company"),companyController.getMe);

router.get('/:companyId',checkAuth,companyController.grantAccess("readAny","company"),companyController.getMe);

router.delete('/:companyId',checkAuth,companyController.grantAccess("deleteOwn","company"),companyController.delete);

router.patch('/:companyId',checkAuth,companyController.grantAccess("updateOwn","company"),companyController.update);

router.post('/deladmin/:companyId',checkAuth,companyController.grantAccess("updateOwn","company"),companyController.deleteAdmin);

router.post('/deltechnician/:companyId',checkAuth,companyController.grantAccess("updateOwn","company"),companyController.deleteTechnicians)


module.exports = router;