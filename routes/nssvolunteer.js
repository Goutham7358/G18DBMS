const express = require('express');

const nssVounteerController = require('../controllers/nssvolunteer');

const router = express.Router();

router.get('/nssvolunteer', nssVounteerController.getNssvolunteer);

router.post('/takefarmwork', nssVounteerController.postTakefarmwork);

module.exports = router;

