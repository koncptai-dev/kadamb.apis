const { Op } = require("sequelize");
const CircularRank = require("../models/CircularRank");
const AgentCommission = require("../models/AgentCommission");
const AgentCommissionTracker= require("../models/AgentCommissionTracker");
const Agent = require("../models/Agent");
const AgentCircularReward = require("../models/AgentCircularReward");

exports.getSubAgentRewards = async (req, res) => {
  const agentId = req.user.id;

  // Extract from query string
  const { startDate, endDate } = req.query;

  // Validate input
  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "startDate and endDate query parameters are required.",
    });
  }

  try {
    const circulars = await CircularRank.findAll();
    const results = [];

    for (const circular of circulars) {
      const { id, name, rank_level, target_amount, reward_amount } = circular;

      // Self income
      const selfIncome = await AgentCommissionTracker.sum("commissionAmount", {
        where: {
          agentId,
          timestamp: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
      });

      //  Team income from downline agents
      const downlineAgents = await Agent.findAll({ where: { parentId: agentId } });
      const downlineIds = downlineAgents.map(agent => agent.id);

      let teamIncome = 0;
      if (downlineIds.length > 0) {
        teamIncome = await AgentCommissionTracker.sum("commissionAmount", {
          where: {
            agentId: { [Op.in]: downlineIds },
            timestamp: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
        });
      }

      const totalIncome = (selfIncome || 0) + (teamIncome || 0);
      const status = totalIncome >= target_amount ? "Achieved" : "Pending";
      const remainingTeamIncome = Math.max(0, target_amount - totalIncome);

      if (status === "Achieved") {
        await AgentCircularReward.findOrCreate({
          where: {
            agentId,
            circularId: id,
          },
          defaults: {
            payoutNumber: `Payout-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            circularName: name,
            rankLevel: rank_level,
            target: target_amount,
            rewardAmount: reward_amount,
            status,
            selfIncome: selfIncome || 0,
            teamIncome: teamIncome || 0,
            remainingTeamIncome,
          },
        });
      }

      results.push({
        id,
        name,
        rankLevel: rank_level,
        target: target_amount,
        rewardAmount: reward_amount,
        status,
        selfIncome: selfIncome || 0,
        teamIncome: teamIncome || 0,
        remainingTeamIncome,
      });
    }

    return res.status(201).json({
      message: "Achieved agent rewards created successfully.",
      data: results,
    });

  } catch (err) {
    console.error("Error in getSubAgentRewards:", err);
    return res.status(500).json({
      message: "Internal error while calculating circular rewards.",
      error: err.message,
    });
  }
};
