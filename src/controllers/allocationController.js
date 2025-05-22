const Allocation = require('../models/allocation');
const EMIPayment = require('../models/emipayment');
const Agent = require('../models/Agent');
const moment = require('moment'); // install if not already: npm install moment


// Allocate a plot to a customer
exports.allocatePlot = async (req, res) => {
    try {
        const {
            amount,
            downPayment ,
            emiDuration,
            emiStartDate
        } = req.body;

        let emiMonthly = 0;
        let emiEndDate = emiStartDate;

        // Calculate EMI monthly and end date (no interest)
        if (emiDuration && amount && amount > 0) {
            const principal = amount - downPayment;

            emiMonthly = principal / emiDuration;
            emiMonthly = parseFloat(emiMonthly.toFixed(2)); // 2 decimal places

            emiEndDate = moment(emiStartDate).add(emiDuration, 'months').format('YYYY-MM-DD');
        }

        // Create allocation with computed values
        const allocation = await Allocation.create({
            ...req.body,
            emiMonthly,
            emiEndDate
        });

        return res.status(201).json({
            message: "Plot allocated successfully",
            allocation
        });
    } catch (error) {
        console.error("Error allocating plot:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


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
        const {
            amount,
            downPayment,
            emiDuration,
            emiStartDate
        } = req.body;

        const allocation = await Allocation.findByPk(id);

        if (!allocation) {
            return res.status(404).json({ error: "Allocation not found" });
        }

        let emiMonthly = allocation.emiMonthly;  
        let emiEndDate = allocation.emiEndDate;  

        if (emiDuration && amount && amount > 0) {
            const principal = amount - downPayment;
            emiMonthly = principal / emiDuration;
            emiMonthly = parseFloat(emiMonthly.toFixed(2)); // 2 decimal places

            emiEndDate = moment(emiStartDate).add(emiDuration, 'months').format('YYYY-MM-DD');
        }

        // Update allocation with the new EMI details
        await allocation.update({
            ...req.body,  
            emiMonthly,  
            emiEndDate    
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
        const { id } = req.params;
        const allocation = await Allocation.findByPk(id);

        if (!allocation) {
            return res.status(404).json({ error: "Allocation not found" });
        }
        await allocation.destroy();
        return res.status(200).json({ message: "Allocation deleted successfully" });
    } catch (error) {
        console.error("Error deleting allocation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
