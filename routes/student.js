const express = require('express');

const studentController = require('../controllers/student');

const router = express.Router();

router.get('/student',studentController.getStudent);
router.post('/joinfarmwork',studentController.postJoinfarmwork)

module.exports = router;