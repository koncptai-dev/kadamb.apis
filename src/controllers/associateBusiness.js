// controllers/associateBusinessController.js
const { Agent, Allocation, AgentCommissionTracker } = require("../models");
const { Op } = require("sequelize");

exports.getAssociateBusiness = async (req, res) => {
  try {
    const parentAgentId = req.query.agentId; // Logged-in agent
    const {
      startDate,
      endDate,
      downline = "all",          // 'direct', or 'all'
      businessType,              // e.g. 'EMI', 'One-time'
      page = 1,
      pageSize = 10,
      search = ""
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate & endDate required" });
    }

    // Get relevant agent IDs
    let agentIds = [parentAgentId];

    if (downline === "direct") {
      const direct = await Agent.findAll({ where: { parentId: parentAgentId }, attributes: ["id"] });
      agentIds.push(...direct.map(a => a.id));
    } else if (downline === "all") {
      // Include nested downline recursively
      const recursiveFetch = async (ids, acc = []) => {
        const subs = await Agent.findAll({ where: { parentId: { [Op.in]: ids } }, attributes: ["id"] });
        const subIds = subs.map(a => a.id).filter(i => !acc.includes(i));
        if (!subIds.length) return acc;
        acc.push(...subIds);
        return recursiveFetch(subIds, acc);
      };
      agentIds.push(...await recursiveFetch([parentAgentId]));
    }

    // Build filters
    const whereAlloc = {
      agentId: { [Op.in]: agentIds },
      allocationDate: { [Op.between]: [startDate, endDate] }
    };

    if (businessType) {
      whereAlloc.paymentType = businessType;
    }

    if (search) {
      whereAlloc[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { bookingNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pagination options
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    // Fetch paginated results and total count
    const { count, rows } = await Allocation.findAndCountAll({
      where: whereAlloc,
      order: [["allocationDate", "DESC"]],
      limit,
      offset,
      raw: true
    });

    // Map rows to report structure
    const data = rows.map((row, i) => ({
      sNo: offset + i + 1,
      accountNo: row.bookingNumber,
      holderName: row.customerName,
      associateCode: row.agentId,   // Or fetch agent.associateCode if needed
      payMode: row.paymentMethod,
      period: null,
      opDate: null,
      installmentAmt: row.emiMonthly,
      installmentDate: row.nextDueDate?.split(" ")[0],
      installNo: row.emiDuration,
      freshBusiness: row.bookingNumber.startsWith("NEW") ? row.amount : 0, // Example
      renewal: row.bookingNumber.startsWith("REN") ? row.amount : 0,
      netAmount: row.amount
    }));

    const totalAmount = data.reduce((sum, rec) => sum + rec.netAmount, 0);

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        pageSize: limit
      },
      grandTotal: totalAmount
    });

  } catch (err) {
    console.error("Error generating report", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
