const Allocation = require('../models/allocation');
const EMIPayment = require('../models/emipayment');
const AllocationRequest=require('../models/AllocationRequest');
const Agent = require('../models/Agent');
const moment = require('moment'); // install if not already: npm install moment
const {Op}=require('sequelize');

// AllocationRequest a plot to a customer
exports.allocatePlot = async (req, res) => {
  try {
    let { customerPAN, amount, downPayment, customerAadhar,emiDuration, emiStartDate } = req.body;

    if (!customerPAN || customerPAN.trim() === "") {
      return res.status(400).json({ error: "Customer PAN is required." });
    }
     const existingRequest = await AllocationRequest.findOne({ where: {customerPAN}})
    if (existingRequest) {
      return res.status(400).json({ field: 'customerPAN',error: "Customer PanCard is already there" });}
     const existingRequestAdhar = await AllocationRequest.findOne({ where: {customerAadhar}})
    if (existingRequestAdhar) {
      return res.status(400).json({ field: 'customerAadhar',error: "Customer AdharCard is already there" });}

    // Proceed with EMI calculations

     emiDuration = emiDuration ? parseInt(emiDuration) : null;
    downPayment = downPayment ? parseFloat(downPayment) : 0;
    amount = amount ? parseFloat(amount) : 0;
    emiStartDate =
      emiStartDate && emiStartDate !== "Invalid date"
        ? moment(emiStartDate).format("YYYY-MM-DD")
        : null;

    let emiMonthly = 0;
    let emiEndDate = emiStartDate;

     if (emiDuration && amount > 0) {
      const principal = amount - downPayment;
      emiMonthly = parseFloat((principal / emiDuration).toFixed(2));
      emiEndDate = emiStartDate
        ? moment(emiStartDate).add(emiDuration, "months").format("YYYY-MM-DD")
        : null;
    }

    const allocation = await AllocationRequest.create({
      ...req.body,
      emiMonthly,
      emiEndDate,
      emiDuration,
      downPayment,
      emiStartDate,
      status: "pending",
    });

    return res.status(201).json({
      message: "Plot allocation request submitted for admin approval",
      allocation,
    });
  } catch (error) {
    console.error("Error Submitting Request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

}

// Get all allocated plots
exports.getAllAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.findAll({
          include: [
            {
              model: EMIPayment,
              as: "payments", // Must match the alias in associations
              required: false, // Fetch allocations even if no EMIs exist
            },
            {
                model: Agent,
                as: "agent", // Ensure this matches your association alias
                attributes: ["fullName"], // Fetch only agent's name
                required: false,
            },
          ],
          order: [["allocationDate", "DESC"]], // Sort by latest allocation
        });
    
        res.status(200).json({
          success: true,
          data: allocations,
        });
      } catch (error) {
        console.error("Error fetching allocations:", error);
        res.status(500).json({
          success: false,
          message: "Server error",
        });
      }
};

// Get a specific allocated plot by ID
exports.getAllocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const allocation = await Allocation.findByPk(id);

        if (!allocation) {
            return res.status(404).json({ error: "Allocation not found" });
        }

        return res.status(200).json({ allocation });
    } catch (error) {
        console.error("Error fetching allocation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update an allocation
exports.updateAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        let {
            amount,
            downPayment,
            emiDuration,
            emiStartDate,
            customerPAN,
            customerAadhar 
        } = req.body;

        const allocation = await AllocationRequest.findByPk(id);

        if (!allocation) {
            return res.status(404).json({ error: "Allocation not found" });
        }
             const existingRequest = await AllocationRequest.findOne({ where: {customerPAN,id: { [Op.ne]: id }}})
              if (existingRequest) {
                return res.status(400).json({ error: "Customer PanCard is already there" });}
              const existingRequestAdhar = await AllocationRequest.findOne({ where: {customerAadhar,id: { [Op.ne]: id }}})
              if (existingRequestAdhar) {
                return res.status(400).json({ error: "Customer AdharCard is already there" });}

        emiDuration = emiDuration ? parseInt(emiDuration) : null;
    downPayment = downPayment ? parseFloat(downPayment) : 0;
    amount = amount ? parseFloat(amount) : 0;
    emiStartDate =
      emiStartDate && emiStartDate !== "Invalid date"
        ? moment(emiStartDate).format("YYYY-MM-DD")
        : null;

    let emiMonthly = 0;
    let emiEndDate = emiStartDate;

     if (emiDuration && amount > 0) {
      const principal = amount - downPayment;
      emiMonthly = parseFloat((principal / emiDuration).toFixed(2));
      emiEndDate = emiStartDate
        ? moment(emiStartDate).add(emiDuration, "months").format("YYYY-MM-DD")
        : null;
    }console.log(emiMonthly,emiEndDate,emiDuration,downPayment,emiStartDate);
    

        // Update allocation with the new EMI details
        await allocation.update({
            ...req.body,  
           emiMonthly,
          emiEndDate,
          emiDuration,
          downPayment,
          emiStartDate,  
        });

        return res.status(200).json({
            message: "Allocation updated successfully",
            allocation
        });
    } catch (error) {
        console.error("Error updating allocation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// Delete an allocation
exports.deleteAllocation = async (req, res) => {
    try {
        const pending = await AllocationRequest.findByPk(id);
        if (!pending || pending.status !== 'pending') {
          return res.status(404).json({ error: 'Request not found or already processed' });
        }
        // Delete the pending allocation request
        await pending.destroy();
       res.status(200).json({ message: 'Request denied and deleted' });
    } catch (error) {
        console.error("Error deleting allocation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

