const EMIPayment = require("../models/emipayment");
const Allocation = require("../models/allocation");
const AgentCommission = require("../models/AgentCommission");
const AgentCommissionTracker = require("../models/AgentCommissionTracker");
const Agent = require("../models/Agent");
const CommissionLevel  = require("../models/CommissionLevel");
const moment=require("moment");
const sequelize = require("../config/database");

 // Make an EMI Payment
 exports.makeEMIPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { allocationId, emiAmountPaid, paymentMode, transactionNumber, remarks, status } = req.body;

    const validStatuses = ["Pending", "Completed", "Partially Paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Choose from: Pending, Completed, Partially Paid" });
    }

    const allocation = await Allocation.findByPk(allocationId, { transaction });
    if (!allocation) {
      await transaction.rollback();
      return res.status(404).json({ error: "Allocation not found" });
    }

    if (allocation.paymentType !== "EMI") {
      await transaction.rollback();
      return res.status(400).json({ error: "Payment type is not EMI." });
    }

    if (allocation.remainingEmiAmount === null || allocation.remainingEmiAmount === 0) {
      allocation.remainingEmiAmount = allocation.amount;
    }
    if (allocation.remainingEmi === null || allocation.remainingEmi === 0) {
      allocation.remainingEmi = allocation.emiDuration;
    }

    if (allocation.remainingEmiAmount === 0 || allocation.remainingEmi === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "All EMIs are already paid." });
    }

    let updatedRemainingEmiAmount = parseFloat(allocation.remainingEmiAmount) - parseFloat(emiAmountPaid);
    let updatedRemainingEmi = parseInt(allocation.remainingEmi) - 1;

    if (updatedRemainingEmiAmount < 0) updatedRemainingEmiAmount = 0;
    if (updatedRemainingEmi < 0) updatedRemainingEmi = 0;

    //next due date calculation
    let nextPaymentDate;

    if(!allocation.nextDueDate){
      nextPaymentDate = moment().add(1, 'months').date(moment().date()).startOf('day').format('YYYY-MM-DD');
    }
    else{
      nextPaymentDate = moment(allocation.nextDueDate).add(1, 'months').date(moment(allocation.nextDueDate).date()).startOf('day').toDate();

    }

    await allocation.update({
      remainingEmiAmount: updatedRemainingEmiAmount,
      remainingEmi: updatedRemainingEmi,
      nextDueDate:nextPaymentDate, //clear if all paid 
    }, { transaction });

    //receipt number generation
    const lastEmiPayment=await EMIPayment.findOne({
      where: { allocationId },
      order: [['receiptNumber', 'DESC']],  // Order by receiptNumber in descending order
      transaction
    })

    const receiptNumber = lastEmiPayment ? lastEmiPayment.receiptNumber + 1 : 1; // Increment the last receipt number or set to 1 for the first payment.

    const emiPayment = await EMIPayment.create({
      allocationId,
      emiAmountPaid,
      remainingEMIAmount: updatedRemainingEmiAmount,
      totalEMIRemaining: updatedRemainingEmi,
      paymentMode,
      transactionNumber,
      status,
      remarks,
      receiptNumber,
      nextDueDate: updatedRemainingEmi > 0 ? nextPaymentDate : null,
    }, { transaction });

    console.log("EMI Payment created:", emiPayment);

    // Fetch commission levels in ascending order
    const commissionLevels = await CommissionLevel.findAll({
      order: [["level", "ASC"]],
      transaction
    });

    if (!commissionLevels.length) {
      await transaction.rollback();
      return res.status(500).json({ error: "No commission levels found in database." });
    }

    // Fetch the first agent linked to the allocation
    let agent = await Agent.findByPk(allocation.agentId, { transaction });
    if (!agent) {
      await transaction.rollback();
      return res.status(404).json({ error: "Agent not found for this property allocation." });
    }

    let agentHierarchy = [];
    let level = 0;

    // Get agent hierarchy (starting from seller and moving up)
    while (agent && level < commissionLevels.length) {
      agentHierarchy.unshift(agent); // Puts parent agents first
      if (!agent.parentId) break;
      agent = await Agent.findByPk(agent.parentId, { transaction });
      level++;
    }

    console.log("Agent hierarchy (bottom to top):", agentHierarchy.map(a => a.id));

    let previousCommissionPercentage = 0;

    // Loop bottom-up (from seller to higher levels)
    for (let i = agentHierarchy.length - 1; i >= 0; i--) {
      const agent = agentHierarchy[i];
      const commissionPercentage = commissionLevels[i]?.commissionPercentage || 0;

      let commissionAmount;
      if (i === agentHierarchy.length - 1) {
        // First agent (seller) gets full commission
        commissionAmount = (emiAmountPaid * commissionPercentage) / 100;
      } else {
        // Higher levels get only the difference in percentage
        const percentageDifference = commissionPercentage - previousCommissionPercentage;
        commissionAmount = (emiAmountPaid * percentageDifference) / 100;
      }

      // Ensure commission is not negative
      commissionAmount = Math.max(commissionAmount, 0);

      console.log(`Agent ID: ${agent.id}, Level: ${i + 1}, Commission: ₹${commissionAmount}`);

      if (commissionAmount > 0) {
        await AgentCommissionTracker.create({
          agentId: agent.id,
          allocationId,
          commissionAmount
        }, { transaction });

        const existingCommission = await AgentCommission.findOne({
          where: { agentId: agent.id },
          transaction
        });

        if (existingCommission) {
          await existingCommission.update({
            commissionAmount: sequelize.literal(`commissionAmount + ${commissionAmount}`)
          }, { transaction });
        } else {
          await AgentCommission.create({
            agentId: agent.id,
            commissionAmount
          }, { transaction });
        }
      }

      // Update previousCommissionPercentage for the next iteration
      previousCommissionPercentage = commissionPercentage;
    }   

    await transaction.commit();
    return res.status(201).json({
      message: "EMI Payment recorded successfully and commissions distributed.",
      emiPayment,
      updatedAllocation: {
        remainingEmiAmount: updatedRemainingEmiAmount,
        remainingEmi: updatedRemainingEmi,
        nextDueDate: updatedRemainingEmi > 0 ? nextPaymentDate : null,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing EMI payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateEMIPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { emiAmountPaid, paymentMode, transactionNumber, remarks, status } = req.body;

    console.log("Received emiAmountPaid:", emiAmountPaid);

    // Validate status input
    const validStatuses = ["Pending", "Completed", "Partially Paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Choose from: Pending, Completed, Partially Paid" });
    }

    // Find existing EMI payment
    const emiPayment = await EMIPayment.findByPk(id);
    if (!emiPayment) {
      return res.status(404).json({ error: "EMI Payment record not found" });
    }

    // Find the associated allocation
    const allocation = await Allocation.findByPk(emiPayment.allocationId);
    if (!allocation) {
      return res.status(404).json({ error: "Allocation record not found" });
    }

    // Ensure emiAmountPaid is a valid number
    const newEmiAmount = Number(emiAmountPaid);
    if (isNaN(newEmiAmount) || newEmiAmount < 0) {
      return res.status(400).json({ error: "Payment amount must be a valid number greater than or equal to zero" });
    }

    // Prevent unrealistic values
    if (newEmiAmount > 1000000) {
      return res.status(400).json({ error: "Payment amount is too large!" });
    }

    // **Step 1: Retrieve previous amount**
    const previousEmiAmount = emiPayment.emiAmountPaid; // The old payment amount

    // **Step 2: Calculate difference**
    const amountDifference = newEmiAmount - previousEmiAmount;

    // **Step 3: Update the Allocation only if amount has changed**
    let updatedRemainingEmiAmount = allocation.remainingEmiAmount - amountDifference;

    // Ensure values do not go negative
    if (updatedRemainingEmiAmount < 0) updatedRemainingEmiAmount = 0;

    // **Update Allocation Record**
    await allocation.update({
      remainingEmiAmount: updatedRemainingEmiAmount,
    });

    // **Update EMI Payment Record**
    await emiPayment.update({
      emiAmountPaid: newEmiAmount, // Update with the new amount
      remainingEMIAmount: updatedRemainingEmiAmount, // Reflect the new remaining amount
      paymentMode,
      transactionNumber,
      status, // User-defined status
      remarks,
    });

    return res.status(200).json({
      message: "EMI Payment updated successfully",
      emiPayment,
      updatedAllocation: {
        remainingEmiAmount: updatedRemainingEmiAmount,
      },
    });

  } catch (error) {
    console.error("Error updating EMI payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};






