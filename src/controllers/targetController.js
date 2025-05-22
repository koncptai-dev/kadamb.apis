const Target = require("../models/Target"); // ✅ Correct model import
const Agent = require("../models/Agent"); // ✅ Correct model import
const AgentCommission = require("../models/AgentCommission");
const { Op } = require("sequelize");

// Create target
exports.createTarget = async (req, res) => {
    try {
        const { startDate, endDate, targetAmount } = req.body;
        const agentId = req.user.id; // Extract agentId from JWT token

        console.log("Decoded JWT User:", req.user); // Debug log

        if (!agentId || !startDate || !endDate || !targetAmount) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newTarget = await Target.create({ agentId, startDate, endDate, targetAmount });

        res.status(201).json({ message: "Target created successfully", target: newTarget });
    } catch (error) {
        console.error("Error creating target:", error);
        res.status(500).json({ message: "Error creating target", error: error.message });
    }
};

// Get all targets with agent name
exports.getAllTargets = async (req, res) => {
    try {
        const agentId = req.user.id; // Extract agentId from JWT token

        const targets = await Target.findAll({ where: { agentId } });

        // Fetch agent name manually

        const targetsWithAgentName = targets.map((target) => ({
            ...target.toJSON(),
        }));

        res.status(200).json(targetsWithAgentName);
    } catch (error) {
        console.error("Error fetching targets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get target report
exports.getTargetReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const agentId = req.user.id; // Extract agentId from token
        
        // Fetch self targets within the date range
        let targetConditions = { agentId };
        if (startDate && endDate) {
            targetConditions.startDate = { [Op.gte]: startDate };
            targetConditions.endDate = { [Op.lte]: endDate };
        }
        
        const selfTargets = await Target.findAll({ where: targetConditions });
        const selfTargetAmount = selfTargets.reduce((sum, t) => sum + t.targetAmount, 0);

        // Find child agents (team members)
        const teamMembers = await Agent.findAll({ where: { parentId: agentId } });
        const teamAgentIds = teamMembers.map(agent => agent.id);

        // Fetch team targets
        const teamTargets = await Target.findAll({
            where: {
                agentId: { [Op.in]: teamAgentIds },
                startDate: { [Op.gte]: startDate || '2000-01-01' },
                endDate: { [Op.lte]: endDate || '2099-12-31' }
            }
        });
        const teamTargetAmount = teamTargets.reduce((sum, t) => sum + t.targetAmount, 0);
        const totalTarget = selfTargetAmount + teamTargetAmount;

        // Fetch self business from agent_commission table
        const selfBusiness = await AgentCommission.sum('commissionAmount', {
            where: { agentId }
        });

        // Fetch team business from agent_commission table
        const teamBusiness = await AgentCommission.sum('commissionAmount', {
            where: { agentId: { [Op.in]: teamAgentIds } }
        });
        
        const totalBusiness = (selfBusiness || 0) + (teamBusiness || 0);
        const remainingBusiness = totalTarget - totalBusiness;

        res.json({
            agentId,
            selfTarget: selfTargetAmount,
            teamTarget: teamTargetAmount,
            totalTarget,
            selfBusiness: selfBusiness || 0,
            teamBusiness: teamBusiness || 0,
            totalBusiness,
            remainingBusiness
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};