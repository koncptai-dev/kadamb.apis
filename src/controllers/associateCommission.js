const { Allocation, EMIPayment, Agent } = require("../models");
const moment = require("moment");
const AgentCircularReward = require("../models/AgentCircularReward");
const CircularRank = require("../models/CircularRank");

exports.getAgentPayouts = async (req, res) => {
  const agentId = req.user.id;
  const { payoutNo } = req.query;

  try {
    const agent = await Agent.findByPk(agentId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    const earningPercentage = Number(agent.commissionPercentage) || 0;
console.log(`Earning Percentage: ${earningPercentage}%`);

    const rewards = await AgentCircularReward.findAll({
      where: {
        agentId: agent.id,
        ...(payoutNo ? { payoutNumber: payoutNo } : {})
      },
      include: [{ model: CircularRank, as: "CircularRank" }],
      order: [["createdAt", "DESC"]],
    });

    const allocations = await Allocation.findAll({
      where: { agentId: agent.id },
      attributes: ["id"]
    });

    const allocationIds = allocations.map(a => a.id);

    const payments = await EMIPayment.findAll({
      where: {
        allocationId: allocationIds,
        status: "Completed"
      },
      attributes: ["emiAmountPaid", "paymentDate"]
    });

    const emiMapByMonth = {};
    for (let payment of payments) {
      const month = moment(payment.paymentDate).format("YYYY-MM");
      if (!emiMapByMonth[month]) emiMapByMonth[month] = [];
      emiMapByMonth[month].push({
        emiAmountPaid: parseFloat(payment.emiAmountPaid || 0),
        paymentDate: payment.paymentDate,
        
      });
    }

    const formatted = rewards.map((r, index) => {
      const reward = Number(r.CircularRank?.reward_amount || 0);
      const tdsAmount = +(reward * 0.01).toFixed(2);
      const ChqAmount = +(reward - tdsAmount).toFixed(2);

      const monthKey = moment(r.CircularRank?.month).format("YYYY-MM");
      const emiPayments = emiMapByMonth[monthKey] || [];
      const collection = emiPayments.reduce((acc, p) => acc + p.emiAmountPaid, 0);

      const totalEarning = +((collection * earningPercentage) / 100).toFixed(2);
console.log(totalEarning);

      return {
        sno: index + 1,
        monthOf: r.CircularRank?.month,
        rankLevel: r.CircularRank?.rank_level,
        oreIncentive: 0.00,
        netIncome: reward,
        tdsOnAmount: reward,
        tds: tdsAmount,
        welfare: 0.00,
        maturityComm: 0,
        cheqAmount: ChqAmount,
        collection: +collection.toFixed(2),
        totalEarning,
        emiPayments,
        earningPercentage // send full EMI breakdown report  to frontend
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error in getAgentPayouts:", error);
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
