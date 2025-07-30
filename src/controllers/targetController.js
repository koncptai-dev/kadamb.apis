const Target = require("../models/Target"); //  Correct model import
const Agent = require("../models/Agent"); //  Correct model import
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
        const agentId = req.user.id;

        // Fetch self targets
        let targetConditions = { agentId };
        if (startDate && endDate) {
            targetConditions.startDate = { [Op.gte]: startDate };
            targetConditions.endDate = { [Op.lte]: endDate };
        }

        const selfTargets = await Target.findAll({ where: targetConditions });
        const selfTargetAmount = selfTargets.reduce((sum, t) => sum + t.targetAmount, 0);

        // Team members
        const teamMembers = await Agent.findAll({ where: { parentId: agentId } });
        console.log("Team Members:", teamMembers);
        
        const teamAgentIds = teamMembers.map(agent => agent.id);
        console.log("Team Agent IDs:", teamAgentIds);
        

        // Team targets
        const teamTargets = await Target.findAll({
            where: {
                agentId: { [Op.in]: teamAgentIds },
                startDate: { [Op.gte]: startDate || '2000-01-01' },
                endDate: { [Op.lte]: endDate || '2099-12-31' }
            }
        });
        const teamTargetAmount = teamTargets.reduce((sum, t) => sum + t.targetAmount, 0);
        const totalTarget = selfTargetAmount + teamTargetAmount;

        // Business
        const selfBusiness = await AgentCommission.sum('commissionAmount', { where: { agentId } });
        const teamBusiness = await AgentCommission.sum('commissionAmount', {
            where: { agentId: { [Op.in]: teamAgentIds } }
        });
        console.log(`team business:`,teamBusiness);
        
        const totalBusiness = (selfBusiness || 0) + (teamBusiness || 0);
        const remainingBusiness = totalTarget > totalBusiness ? totalTarget - totalBusiness : 0;

        // Commission Chart
        // const commissionChart = [
            
        //     { rank: 0, target: 1000, commission: 11 },
        //     { rank: 1, target: 100000, commission: 6 },
        //     { rank: 2, target: 300000, commission: 7 },
        //     { rank: 3, target: 1000000, commission: 8 },
        //     { rank: 4, target: 2500000, commission: 10 },
        //     { rank: 5, target: 6000000, commission: 12 },
        //     { rank: 6, target: 9000000, commission: 14 },
        //     { rank: 7, target: 13000000, commission: 15 },
        //     { rank: 8, target: 17000000, commission: 16 },
        //     { rank: 9, target: 21000000, commission: 17 },
        //     { rank: 10, target: 26000000, commission: 18 },
        //     { rank: 11, target: 30000000, commission: 19 },
        //     { rank: 12, target: 40000000, commission: 20 },
        //     { rank: 13, target: 50000000, commission: 21 },
        //     { rank: 14, target: 60000000, commission: 22 },
        // ];

        // const getCommissionByBusinessAmount = (amount) => {
        //     let commission = 0;
        //     for (let i = 0; i < commissionChart.length; i++) {
        //         if (amount >= commissionChart[i].target) {
        //             commission = commissionChart[i].commission;
        //         } else {
        //             break;
        //         }
        //     }
        //     return commission;
        // };

        // const newCommissionPercent = getCommissionByBusinessAmount(selfBusiness || 0); //  use only self business
        // const agent = await Agent.findByPk(agentId);
        // if (agent) {
        //     const currentCommission = parseFloat(agent.commissionPercentage) || 0;

        //     if (currentCommission < newCommissionPercent) {
        //         await agent.update({ commissionPercentage: newCommissionPercent });
        //         await agent.reload();
        //     } else {
        //         console.log(`ℹ No update needed. Current commission is already ${currentCommission}%`);
        //     }
        // }

        res.json({
            agentId,
            selfTarget: selfTargetAmount,
            teamTarget: teamTargetAmount,
            totalTarget,
            selfBusiness: selfBusiness || 0,
            teamBusiness: teamBusiness || 0,
            totalBusiness,
            remainingBusiness,
            // updatedCommissionPercent: newCommissionPercent
        });

    } catch (error) {
        console.error("Error in getTargetReport:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
