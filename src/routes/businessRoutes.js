const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Emipayments = require("../models/emipayment");
const Agent = require("../models/Agent");
const AgentCommissionTracker = require("../models/AgentCommissionTracker");
const Allocation = require("../models/allocation");  // Ensure Allocation model is imported
const authenticate = require('../middlewares/auth');

// Recursive function to get downline agents
const getDownlineAgents = async (agentId) => {
    let downline = await Agent.findAll({ where: { parentId: agentId } });
    let allAgents = [...downline];

    for (let agent of downline) {
        let subAgents = await getDownlineAgents(agent.id);
        allAgents = [...allAgents, ...subAgents];
    }
    return allAgents;
};

// Recursive function to get uplines (parents)
const getUplineAgents = async (agentId) => {
    let uplines = [];
    let currentAgent = await Agent.findOne({ where: { id: agentId } });

    while (currentAgent && currentAgent.parentId) {
        let parentAgent = await Agent.findOne({ where: { id: currentAgent.parentId } });
        if (!parentAgent) break;
        uplines.push(parentAgent);
        currentAgent = parentAgent;
    }
    return uplines;
};

// API to fetch business commission with full hierarchy
router.get('/BusinessCommission', authenticate, async (req, res) => {
    try {
        const { startDate, endDate, downlineType } = req.query;
        const loggedInAgentId = req.user.id;

        let agentIds = [loggedInAgentId];

        if (downlineType === 'downline') {
            let downlineAgents = await getDownlineAgents(loggedInAgentId);
            let uplines = await getUplineAgents(loggedInAgentId);
            agentIds = [...agentIds, ...downlineAgents.map(a => a.id), ...uplines.map(a => a.id)];
        } else if (downlineType === 'direct') {
            let directAgents = await Agent.findAll({ where: { parentId: loggedInAgentId } });
            agentIds = [...agentIds, ...directAgents.map(a => a.id)];
        }

        // Build WHERE condition dynamically
        let whereCondition = { agentId: { [Op.in]: agentIds } };
        if (startDate && endDate) {
            whereCondition.timestamp = { [Op.between]: [startDate, endDate] };
        }

        // Fetch commission records
        const commissions = await AgentCommissionTracker.findAll({
            where: whereCondition,
            order: [['timestamp', 'DESC']],
            raw: true
        });

        // Fetch additional information for response
        let enrichedData = await Promise.all(commissions.map(async (commission) => {
            let agent = await Agent.findOne({ where: { id: commission.agentId }, raw: true });
            let allocation = await Allocation.findOne({ where: { id: commission.allocationId }, raw: true });

            let customer = allocation ? {
                name: allocation.customerName,
                email: allocation.customerEmail,
                mobile: allocation.customerMobile,
                address: allocation.customerAddress,
                gender: allocation.customerGender,
                aadhar: allocation.customerAadhar,
                pan: allocation.customerPAN,
                bankName: allocation.bankName,
                ifscCode: allocation.ifscCode,
                accountNumber: allocation.accountNumber
            } : null;

            return {
                ...commission,
                agentName: agent ? agent.fullname : null,
                associateCode: agent ? agent.associateCode : null,
                allocationDetails: allocation || null,
                customerDetails: customer
            };
        }));

        return res.json({ success: true, data: enrichedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
