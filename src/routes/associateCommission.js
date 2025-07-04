const express = require("express");
const router = express.Router();
const associateCommission=require("../controllers/associateCommission");
const authenticateToken =  require('../middlewares/auth');

router.get('/getpayout',authenticateToken,associateCommission.getAgentPayouts)
router.get("/getpayout-numbers", authenticateToken, associateCommission.getPayoutNumbers);

module.exports = router;
