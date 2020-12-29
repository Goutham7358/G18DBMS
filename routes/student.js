const express = require('express');

const studentController = require('../controllers/student');

const router = express.Router();

router.get('/student',studentController.getStudent);
router.post('/joinfarmwork',studentController.postJoinfarmwork)

router.get('/createsplgrp',studentController.getCreateSplGrp);
router.post('/createsplgrp',studentController.postCreateSplGrp);

module.exports = router;