const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const agentCommissionController = require('../controllers/agentCommissionSummary');
const authenticateToken =  require('../middlewares/auth');


router.get('/agent-commission-summary', authenticateToken, agentCommissionController.getAgentCommissionSummary);

module.exports = router;