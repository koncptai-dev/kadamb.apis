// controllers/AgentRewardController.js
const { Op } = require("sequelize");
const CircularRank = require("../models/CircularRank");
const AgentCommission = require("../models/AgentCommission");
const Agent = require("../models/Agent");

exports.getSubAgentRewards = async (req, res) => {
  const agentId = req.user.id; 
  try {
    const circulars = await CircularRank.findAll();

    const results = [];

    for (const circular of circulars) {
      const { id, name, rank_level, target_amount, reward_amount} = circular;

      // Self Income
      const selfIncome = await AgentCommission.sum('commissionAmount', { where: { agentId } });
        
      const downlineAgents = await Agent.findAll({ where: { parentId: agentId } });       
      const downlineIds = downlineAgents.map(agent => agent.id);
      console.log(downlineIds);
      
      let teamIncome = 0;
      if (downlineIds.length > 0) {
         teamIncome = await AgentCommission.sum('commissionAmount', {
            where: { agentId: { [Op.in]: downlineIds } }
        });
      }

      const totalIncome = (selfIncome || 0) + (teamIncome || 0);
      // console.log(totalIncome);
      
      const status = totalIncome >= target_amount ? "Achieved" : "Pending";
      // console.log(status);
      
      const remainingTeamIncome = target_amount - totalIncome > 0 ? target_amount - totalIncome : 0;
      // console.log(remainingTeamIncome);
      
// console.log(`Circular: ${name}, Rank: ${rank_level}`);
// console.log(`SelfIncome for agent ${agentId}: ${selfIncome}`);
// console.log(`TeamIncome for agent ${agentId}: ${teamIncome}`);

      results.push({
        id,
        name,
        rankLevel: rank_level,
        target: target_amount,
        rewardAmount: reward_amount,
        status,
        selfIncome: selfIncome || 0,
        teamIncome: teamIncome || 0,
        remainingTeamIncome
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Error in agent reward status:", err);
    res.status(500).json({ message: "Internal error", error: err.message });
  }
}; 