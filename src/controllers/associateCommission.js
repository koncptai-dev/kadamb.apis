const { Allocation, EMIPayment, Agent, AgentCommissionTracker } = require("../models");
const moment = require("moment");
const AgentCircularReward = require("../models/AgentCircularReward");
const CircularRank = require("../models/CircularRank");

exports.getAgentPayouts = async (req, res) => {

  const agentId = req.user.id;
  const { payoutNo } = req.query;

  try {
    const agent = await Agent.findByPk(agentId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    const rewards = await AgentCircularReward.findAll({
      where: {
        agentId: agent.id,
        ...(payoutNo ? { payoutNumber: payoutNo } : {})
      },
      include: [{ model: CircularRank,  as: "CircularRank" }],
      order: [["createdAt", "DESC"]],
    });

    const formatted = rewards.map((r, index) => {

      const reward = Number(r.CircularRank?.reward_amount || 0);
      const tdsAmount = +(reward * 0.01).toFixed(2);
      const ChqAmount= +(reward - tdsAmount).toFixed(2);
      const CollectionAmount=(reward/0.06).toFixed(2);

      return{
      sno: index + 1,
      monthOf: r.CircularRank?.month,
      rankLevel: r.CircularRank?.rank_level,
      oreIncentive: 0.00 ,
      netIncome: reward,
      tdsOnAmount:reward,
      tds: tdsAmount,
      welfare:0.00,
      maturityComm:0,
      cheqAmount:ChqAmount,
      collection: CollectionAmount,     }
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error in getAssociateCircularCommission:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getPayoutNumbers = async (req, res) => {
  try {
    const agentId = req.user.id;

    const payouts = await AgentCircularReward.findAll({
      where: { agentId },
      attributes: ["payoutNumber"],
      group: ["payoutNumber"],
      order: [["payoutNumber", "ASC"]],
    });

    const payoutNumbers = payouts.map(p => p.payoutNumber);
    res.json(payoutNumbers);
  } catch (err) {
    console.error("Error fetching payout numbers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
