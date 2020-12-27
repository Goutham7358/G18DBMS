const express = require('express');

const nssVounteerController = require('../controllers/nssvolunteer');

const router = express.Router();

router.get('/nssvolunteer', nssVounteerController.getNssvolunteer);

router.post('/takefarmwork', nssVounteerController.postTakefarmwork);

router.get('/givefarmproof/:takenfarmId',nssVounteerController.getGiveproof);

router.post('/farmproof',nssVounteerController.postFarmproof);


module.exports = router;

