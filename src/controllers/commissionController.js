const { AgentCommission, AgentCommissionTracker, Agent, Allocation } = require("../models");

// API to get total commission of each agent
exports.getAgentCommissions = async (req, res) => {
  try {
    const agentCommissions = await AgentCommission.findAll({
      attributes: ["agentId", "commissionAmount", "timestamp"],
      include: [
        {
          model: Agent,
          as: "agent", // ✅ Add alias
          attributes: ["fullname"],
          required: true,
        },
      ],
      order: [["timestamp", "DESC"]],
    });

    return res.status(200).json({
      message: "Agent commissions retrieved successfully.",
      data: agentCommissions,
    });
  } catch (error) {
    console.error("Error fetching agent commissions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// API to get commission history with agent & allocation details
exports.getCommissionHistory = async (req, res) => {
  try {
    const commissionHistory = await AgentCommissionTracker.findAll({
      attributes: ["id", "agentId", "allocationId", "commissionAmount", "timestamp"],
      include: [
        {
          model: Agent,
          as: "agent", // ✅ Add alias
          attributes: ["fullname"],
          required: true,
        },
        {
          model: Allocation,
          as: "allocation", // ✅ Add alias
          attributes: ["projectName", "plotSize", "plotNumber"],
          required: true,
        },
      ],
      order: [["timestamp", "DESC"]],
    });

    return res.status(200).json({
      message: "Commission history retrieved successfully.",
      data: commissionHistory,
    });
  } catch (error) {
    console.error("Error fetching commission history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

