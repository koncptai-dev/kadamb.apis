const { Allocation, EMIPayment, Agent } = require("../models");

exports.getAgentInstallments = async (req, res) => {
    try {
        const agentId = req.user.id; // Assuming `req.user.id` contains the logged-in agent's ID

        const installments = await Allocation.findAll({
            where: { agentId }, // Fetch only installments related to the logged-in agent
            include: [
                {
                    model: EMIPayment,
                    as: "payments",
                    required: false,
                },
                {
                    model: Agent,
                    as: "agent",
                    attributes: ["fullName"],
                    required: false,
                },
            ],
            order: [["allocationDate", "DESC"]],
        });

        res.status(200).json({
            success: true,
            data: installments,
        });
    } catch (error) {
        console.error("Error fetching agent installments:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
