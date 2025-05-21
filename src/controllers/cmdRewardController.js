const { Agent, AgentCommission, AgentCommissionTracker, Target, CommissionLevel } = require("../models");
const { Op } = require("sequelize");

exports.getSubAgentRewards = async (req, res) => {
    try {
        const parentAgentId = req.user.id; // Parent agent ID from JWT auth
        const { startDate, endDate } = req.query; // Get date range from request query

        // Validate date input
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Start date and end date are required" });
        }

        // Get all sub-agents under this agent
        const subAgents = await Agent.findAll({ where: { parentId: parentAgentId } });

        let subAgentRewards = [];

        for (let agent of subAgents) {
            const agentId = agent.id;

            // Get agent's commission level
            const commissionLevel = await CommissionLevel.findOne({ 
                where: { id: agent.commissionLevelId }, 
                attributes: ['level'] 
            });

            // Fetch target details for the agent within the date range
            const targetRecord = await Target.findOne({ 
                where: { 
                    agentId, 
                    startDate: { [Op.gte]: startDate }, 
                    endDate: { [Op.lte]: endDate }
                }
            });

            // Determine achievement status
            let achievementStatus = "Not Achieved";
            if (targetRecord) {
                const totalCommissionEarned = await AgentCommissionTracker.sum("commissionAmount", {
                    where: {
                        agentId,
                        timestamp: { [Op.gte]: startDate, [Op.lte]: endDate }
                    }
                });

                if (totalCommissionEarned >= targetRecord.targetAmount) {
                    achievementStatus = "Achieved";
                }
            }

            // Get reward amount (sub-agent commissions within the date range)
            const rewardAmount = await AgentCommissionTracker.sum("commissionAmount", {
                where: { 
                    agentId: { [Op.ne]: parentAgentId }, // All sub-agents except parent
                    timestamp: { [Op.gte]: startDate, [Op.lte]: endDate }
                }
            });

            // Get self income (commissions earned by this agent within date range)
            const selfIncome = await AgentCommission.sum("commissionAmount", { 
                where: { 
                    agentId, 
                    timestamp: { [Op.gte]: startDate, [Op.lte]: endDate } 
                }
            });

            // Calculate team income (self income + reward amount)
            const teamIncome = (selfIncome || 0) + (rewardAmount || 0);

            // Calculate remaining team income (total sub-agent targets - team income)
            const totalTarget = await Target.sum("targetAmount", { 
                where: { 
                    agentId, 
                    startDate: { [Op.gte]: startDate }, 
                    endDate: { [Op.lte]: endDate }
                } 
            });
            const remainingTeamIncome = (totalTarget || 0) - teamIncome;

            // Add agent details
            subAgentRewards.push({
                agentId,
                agentName: agent.fullName,
                level: commissionLevel?.level || "N/A",
                status: targetRecord ? "Active" : "Inactive",
                achievementStatus,
                totalTarget: targetRecord?.targetAmount || 0,
                rewardAmount: rewardAmount || 0,
                selfIncome: selfIncome || 0,
                teamIncome: teamIncome || 0,
                remainingTeamIncome: remainingTeamIncome || 0
            });
        }

        res.status(200).json({ success: true, data: subAgentRewards });

    } catch (error) {
        console.error("Error fetching sub-agent rewards:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
