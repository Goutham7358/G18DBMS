const express = require('express');

const farmheadController = require('../controllers/farmhead');
const router = express.Router();

router.get('/farmhead',farmheadController.getFarmhead);
router.post('/addfarmwork',farmheadController.postFarmwork);
router.get('/approvefarmproof/:submittedfarmId',farmheadController.getApprovefarmproof);
router.post('/approvefarmproof',farmheadController.postApprovefarmproof);

module.exports = router;