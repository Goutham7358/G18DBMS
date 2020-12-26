const express = require('express');

const farmheadController = require('../controllers/farmhead');
const router = express.Router();

router.get('/farmhead',farmheadController.getFarmhead);
router.post('/addfarmwork',farmheadController.postFarmwork);

module.exports = router;