const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/addperson',adminController.getAddperson);

router.post('/addperson',adminController.postAddperson);


module.exports = router;