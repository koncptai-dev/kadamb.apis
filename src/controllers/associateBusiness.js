const { Agent, Allocation } = require("../models");
const { Op } = require("sequelize");

exports.getAssociateBusiness = async (req, res) => {
  try {
    const parentAgentId = req.query.agentId; // Logged-in agent
    const { startDate,endDate,downline = "all", businessType, page = 1, pageSize = 10, search = "" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate & endDate required" });
    }

    // Get relevant agent IDs
    let agentIds = [parentAgentId];

    if (downline === "direct") {
      const directAgents = await Agent.findAll({
        where: { parentId: parentAgentId },
        attributes: ["id"]
      });
      const directIds = directAgents.map(agent => agent.id);
      agentIds=[...directIds];

      console.log("Agent IDs for direct downline:", agentIds);
    }
    else if (downline === "all") {
      // Include nested downline recursively
      const recursiveFetch = async (ids, acc = []) => {
        const subs = await Agent.findAll({ where: { parentId: { [Op.in]: ids } }, attributes: ["id"] });
        const subIds = subs.map(a => a.id).filter(i => !acc.includes(i));
        console.log("Sub IDs found:", subIds);
        
        if (!subIds.length) return acc;
        acc.push(...subIds);
        return recursiveFetch(subIds, acc);
      };
      agentIds.push(...await recursiveFetch([parentAgentId]));
      console.log('hi',agentIds.push(...await recursiveFetch([parentAgentId])));
      
    }

    // Build filters
    const whereAlloc = {
      agentId: { [Op.in]: agentIds },
      allocationDate: { [Op.between]: [startDate, endDate] }
    };

    console.log("Allocation filters:", whereAlloc);
    
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
        include: [
          {
            model: Agent,
            as: "agent", // alias must match the one used in associations
            attributes: ["associateCode"]
          }
        ],
        order: [["allocationDate", "DESC"]],
        limit,
        offset});
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toLocaleDateString("en-IN"); // Indian format
};

    // Map rows to report structure
    const data = rows.map((row, i) => ({
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
  freshBusiness: row.bookingNumber?.startsWith("NEW") ? row.amount : 0,
  renewal: row.bookingNumber?.startsWith("REN") ? row.amount : 0,
  netAmount: row.amount
}));

    console.log(data);
    

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
