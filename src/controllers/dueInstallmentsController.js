const Allocation = require("../models/allocation");
const EmiPayment = require("../models/emipayment");
const Agent = require("../models/Agent");
const { Op } = require("sequelize");
const moment = require("moment"); // Import moment.js for date calculations

// Recursive function to get all sub-agents
const getSubAgents = async (agentIds) => {
    let allSubAgents = [];
    let subAgents = await Agent.findAll({ where: { parentId: { [Op.in]: agentIds } } });

    while (subAgents.length > 0) {
        let subAgentIds = subAgents.map(agent => agent.id);
        allSubAgents.push(...subAgentIds);
        subAgents = await Agent.findAll({ where: { parentId: { [Op.in]: subAgentIds } } });
    }
    
    return allSubAgents;
};

// API to get due installments
exports.getDueInstallments = async (req, res) => {
    
    try {
        const agentId = req.user.id; // Extract agentId from token
        
        const { filterType } = req.query; // 'directSponsor' or 'team'

        const today = new Date();

        let agentIdsToCheck = [];

        if (filterType === "directSponsor") {
            const subAgents = await Agent.findAll({ where: { parentId: agentId } });
            agentIdsToCheck = subAgents.map(agent => agent.id);
            agentIdsToCheck.push(agentId);
        } else if (filterType === "team") {
            agentIdsToCheck = await getSubAgents([agentId]);
            agentIdsToCheck.push(agentId);
        }

        // Get all allocations under the selected agents
        const allocations = await Allocation.findAll({
            where: { agentId: { [Op.in]: agentIdsToCheck } }
        });
      

        let dueInstallments = [];
        for (let allocation of allocations) {
            let emiStartDate = moment(allocation.emiStartDate).startOf("month"); // Use user-provided EMI start date
            let emiEndDate = moment(allocation.emiEndDate).startOf("month"); // Use EMI end date
            let currentMonth = moment().startOf("month"); // Current month
        
            let lastMonthToCheck = emiEndDate.isBefore(currentMonth) ? emiEndDate : currentMonth;
        
            const payments = await EmiPayment.findAll({
                where: { allocationId: allocation.id },
                order: [["createdAt", "ASC"]]
            });
        
            while (emiStartDate <= lastMonthToCheck) {
                let monthPaid = payments.some(payment => 
                    moment(payment.createdAt).format("YYYY-MM") === emiStartDate.format("YYYY-MM")
                );
        
                if (!monthPaid) {
                    dueInstallments.push({
                        customerName: allocation.customerName,
                        customerMobile: allocation.customerMobile,
                        projectName: allocation.projectName,
                        plotNumber: allocation.plotNumber,
                        emiMonthly: allocation.emiMonthly,
                        remainingEmiAmount: allocation.remainingEmiAmount,
                        remainingEmi: allocation.remainingEmi,
                        missingMonth: emiStartDate.format("MMMM YYYY") // Separate entry per month
                    });
                }
        
                emiStartDate.add(1, "month"); // Move to next month
            }          
        }
        
        res.json({ dueInstallments });
    } catch (error) {
        console.error("Error fetching due installments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
