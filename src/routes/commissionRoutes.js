const express = require("express");
const router = express.Router();
const commissionController = require("../controllers/commissionController");

// Route to get total commission per agent
router.get("/agent-commissions", commissionController.getAgentCommissions);

// Route to get commission history
router.get("/commission-history", commissionController.getCommissionHistory);

module.exports = router;
