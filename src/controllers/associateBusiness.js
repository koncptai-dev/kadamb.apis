const { Allocation, Agent, EMIPayment } = require("../models");
const { Op } = require("sequelize");

exports.getAssociateBusiness = async (req, res) => {
  try {
    const parentAgentId = req.query.agentId;
    const {
      startDate,
      endDate,
      downline = "direct",
      businessType,
      page = 1,
      pageSize = 10,
      search = ""
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate & endDate required" });
    }

    // Get agent IDs for downline
    let agentIds = [parentAgentId];
    if (downline === "direct") {
      const directAgents = await Agent.findAll({
        where: { parentId: parentAgentId },
        attributes: ["id"]
      });
      agentIds = directAgents.map(a => a.id);
    }

    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    // Base allocation filter
    let whereAlloc = {
      agentId: { [Op.in]: agentIds }
    };

    if (businessType === "Fresh") {
      whereAlloc.allocationDate = { [Op.between]: [startDate, endDate] };
    }

    if (search) {
      whereAlloc[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { bookingNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    // Include models
    const include = [
      {
        model: Agent,
        as: "agent",
        attributes: ["associateCode"]
      }
    ];

    // Include payments (no date filter)
    include.push({
      model: EMIPayment,
      as: "payments",
      required: businessType === "Renewal" // force at least one EMI for renewals
    });

    // Fetch records
    let { count, rows } = await Allocation.findAndCountAll({
      where: whereAlloc,
      include,
      order: [["allocationDate", "DESC"]]
    });

    if (businessType === "Fresh") {
      rows = rows.filter(row => !row.payments || row.payments.length === 0);
      count = rows.length;
    }

    if (businessType === "Renewal") {
      rows = rows.filter(row => row.payments && row.payments.length > 0);
    }

    // Reapply pagination after filtering
    const paginatedRows = rows.slice(offset, offset + limit);

    // Format date function
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      if (isNaN(date)) return null;
      return date.toLocaleDateString("en-IN");
    };

    // Build final data array
    const data = paginatedRows.map((row, i) => {
      const paymentInRange = (row.payments || []).some(p => {
        const date = new Date(p.paymentDate);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      const lastPayment = row.payments?.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];

      return {
        sNo: offset + i + 1,
        accountNo: row.accountNumber,
        holderName: row.customerName,
        associateCode: row.agent?.associateCode || null,
        payMode: row.paymentMethod,
        period: row.allocationDate && row.nextDueDate
          ? `${formatDate(row.allocationDate)} to ${formatDate(row.nextDueDate)}`
          : null,
        opDate: formatDate(row.allocationDate),
        installmentAmt: row.emiMonthly,
        installmentDate: formatDate(row.nextDueDate),
        installNo: row.emiDuration,
        freshBusiness: businessType === "Fresh" ? row.amount : 0,
        renewal: businessType === "Renewal" ? row.amount : 0,
        netAmount: row.amount,
        paymentInDateRange: paymentInRange,
        totalEmisPaid: row.payments?.length || 0,
        lastPaymentDate: formatDate(lastPayment?.paymentDate)
      };
    });

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
