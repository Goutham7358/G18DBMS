const express = require('express');

const splpeojectvolunteerController = require('../controllers/splprojectvolunteer');
const router = express.Router();

router.get('/splprojectvolunteer',splpeojectvolunteerController.getSplprojectvolunteer);
router.post('/takesplprojectgrp',splpeojectvolunteerController.postTakesplprojectgrp);
router.get('/approvesplprojectgrp/:splprojectgrpId',splpeojectvolunteerController.getApprovesplprojectgrp);
router.post('/approvesplprojectgrp',splpeojectvolunteerController.postApprovesplprojectgrp);

module.exports = router;