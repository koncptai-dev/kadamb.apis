const express = require('express');
const router = express.Router();
const associateBusiness = require('../controllers/associateBusiness');

router.get('/associate-business', associateBusiness.getAssociateBusiness);

module.exports = router;
