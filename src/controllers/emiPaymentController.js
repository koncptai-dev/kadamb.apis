const EMIPayment = require("../models/emipayment");
const Allocation = require("../models/allocation");
const AgentCommission = require("../models/AgentCommission");
const AgentCommissionTracker = require("../models/AgentCommissionTracker");
const CommissionChart = require("../models/CommissionChart");
const Agent = require("../models/Agent");
const moment=require("moment");
const { Op } = require("sequelize");
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

    if (allocation.remainingEmiAmount === 0 || allocation.remainingEmi === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "All EMIs are already paid." });
    }

      const year = new Date().getFullYear().toString().slice(2);
      const day = String(new Date().getDate()).padStart(2, '0');
      const dateCode = `${year}${day}`
      const serialNumber = Math.floor(1000 + Math.random() * 9000);
      const transactionCode = `TXN-${dateCode}${serialNumber}`; 

          const emiPayment = await EMIPayment.create({
            allocationId,
            emiAmountPaid,
            remainingEMIAmount: updatedRemainingEmiAmount,
            totalEMIRemaining: updatedRemainingEmi,
            paymentMode,
            transactionNumber:transactionCode,
            status,
            remarks,
            receiptNumber,
            nextDueDate: updatedRemainingEmi > 0 ? nextPaymentDate : null,
          }, { transaction });

          console.log("EMI Payment created:", emiPayment);

          // Fetch commission levels in ascending order
          // const commissionLevels = await CommissionLevel.findAll({
          //   order: [["level", "ASC"]],
          //   transaction
          // });

          // if (!commissionLevels.length) {
          //   await transaction.rollback();
          //   return res.status(500).json({ error: "No commission levels found in database." });
          // }

          // Fetch the first agent linked to the allocation
      let agent = await Agent.findByPk(allocation.agentId, { transaction });

      console.log(" allocation.agentId =", allocation.agentId);

      if (!agent) {
        await transaction.rollback();
        console.log(" Agent not found for this property allocation.");
        return res.status(404).json({ error: "Agent not found for this property allocation." });
      }

      let agentHierarchy = [];
      const visitedAgentIds = new Set(); //for unique agent tracking
      // Get agent hierarchy (bottom to top)
      while (agent) {
        if (visitedAgentIds.has(agent.id)) {
          console.error(" Cycle detected in agent hierarchy! Agent ID:", agent.id);
          break;
        }
        visitedAgentIds.add(agent.id);
        agentHierarchy.unshift(agent);

        if (!agent.parentId) break;
        agent = await Agent.findByPk(agent.parentId, { transaction });
      }
      let previousCommissionPercentage = 0;


      for (let i = agentHierarchy.length - 1; i >= 0; i--) {
        const currentAgent = agentHierarchy[i];
        const commissionPercentage = currentAgent.commissionPercentage || 0;

        let commissionAmount;

        if (i === agentHierarchy.length - 1) {
          commissionAmount = (emiAmountPaid * commissionPercentage) / 100;
        } else {
          const percentageDifference = commissionPercentage - previousCommissionPercentage;
          commissionAmount = (emiAmountPaid * percentageDifference) / 100;
        }

        commissionAmount = Math.max(commissionAmount, 0);

        if (commissionAmount > 0) {
          try {
            // AgentCommissionTracker entry
            await AgentCommissionTracker.create({
              agentId: currentAgent.id,
              allocationId,
              commissionAmount
            }, { transaction });
            console.log(` Commission Tracker entry created for Agent ID: ${currentAgent.id}`);
          } catch (err) {
            console.error(`Error creating AgentCommissionTracker for Agent ID: ${currentAgent.id}`, err);
          }

          try {
            const existingCommission = await AgentCommission.findOne({
              where: { agentId: currentAgent.id },
              transaction
            });

            if (existingCommission) {
              await existingCommission.update({
                commissionAmount: sequelize.literal(`commissionAmount + ${commissionAmount}`)
              }, { transaction });
            } else {
              await AgentCommission.create({
                agentId: currentAgent.id,
                commissionAmount
              }, { transaction });
            }
          } catch (err) {
            console.error(` Error creating/updating AgentCommission for Agent ID: ${currentAgent.id}`, err);
          }
        } else {
          console.log(` Skipped agent ID: ${currentAgent.id} due to zero commission.`);
        }

        previousCommissionPercentage = commissionPercentage;
        console.log(previousCommissionPercentage= commissionPercentage);
        
      }

      //auto commission percentage increment logic

      const charts = await CommissionChart.findAll({ transaction });

        if (!allocation.agentId) {
          console.log('No agentId found in allocation. Skipping.');
          return;
        }
        console.log(`Starting commission update for agent ID: ${allocation.agentId}`);

        for (const chart of charts) {
          const startDate = moment(chart.startDate);
          const endDate = moment(chart.endDate);
          console.log(`Checking chart ID: ${chart.id}, Period: ${startDate.format()} - ${endDate.format()}`);

          // Step 1: Fetch all tracker entries in range
          const trackers = await AgentCommissionTracker.findAll({
            where: {
              agentId: allocation.agentId,
              timestamp: {
                [Op.between]: [startDate.toDate(), endDate.toDate()],
              },
            },
            transaction,
          });

          console.log(`Found ${trackers.length} tracker(s) for agent ${allocation.agentId}`);

          if (trackers.length === 0) continue;

          // Step 2: Calculate total commission within the chart range
          const totalCommission = trackers.reduce((sum, t) => sum + parseFloat(t.commissionAmount), 0);
          console.log(`Total Commission: ${totalCommission}, Target: ${chart.target}`);

          // Step 3: If target met and no "achievedOn" set for this chart+agent yet
          let achievedTracker = trackers.find(t => t.achievedOn !== null);

          if (totalCommission >= chart.target && !achievedTracker) {
            const latestTracker = trackers.sort((a, b) => moment(b.timestamp) - moment(a.timestamp))[0];

            if (latestTracker) {
              await latestTracker.update({ achievedOn: new Date() }, { transaction });
              console.log(`Target achieved! Set achievedOn for agent ${allocation.agentId}, chart ${chart.id}`);
              achievedTracker = latestTracker;
            } else {
              console.log(' No latest tracker found to mark as achieved.');
              continue;
            }
          }

          if (!achievedTracker) {
            console.log(' No achieved tracker found. Skipping.');
            continue;
          }

          const achievedOn = moment(achievedTracker.achievedOn);
          const chartStart = moment(chart.startDate);
          const chartEnd = moment(chart.endDate);

          // Step 4: Was target achieved within chart period?
          if (!achievedOn.isBetween(chartStart, chartEnd, undefined, '[]')) {
            console.log(`AchievedOn (${achievedOn.format()}) is not within chart range. Skipping.`);
            continue;
          }

          // Step 5: Determine eligible date for commission increase
          const eligibleDate =
            chart.increaseFrom === 'achieved'
              ? achievedOn.clone().add(chart.increaseAfterDays, 'days')
              : chartEnd.clone().add(chart.increaseAfterDays, 'days');

          console.log(`Today: ${moment().format("YYYY-MM-DD")}, Eligible Date: ${eligibleDate.format("YYYY-MM-DD")}`);

          // Step 6: Apply commission increase if eligible
          if (moment().isSameOrAfter(eligibleDate)) {
            const agent = await Agent.findByPk(allocation.agentId, { transaction });

            if (agent) {
              if (agent.commissionPercentage !== chart.commissionPercent) {
                const [updatedRows] = await Agent.update(
                  { commissionPercentage: chart.commissionPercent },
                  { where: { id: allocation.agentId }, transaction }
                );

                if (updatedRows > 0) {
                  console.log(` Commission percentage updated to ${chart.commissionPercent}% for Agent ID: ${allocation.agentId}`);
                } else {
                  console.log(`Update command ran but no rows affected for Agent ID: ${allocation.agentId}`);
                }
              } else {
                console.log(`Agent already has the desired commissionPercentage: ${chart.commissionPercent}%. No update needed.`);
              }
            } else {
              console.log(`Agent with ID ${allocation.agentId} not found.`);
            }
          } else {
            console.log('Not yet eligible for commission update.');
          }
        }

      //final commit
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
        console.log(" Transaction rolled back due to: Allocation not found.");

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









