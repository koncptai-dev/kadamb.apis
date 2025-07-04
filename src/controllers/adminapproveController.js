const Allocation = require('../models/allocation');
const AllocationRequest=require('../models/AllocationRequest');
const Agent = require('../models/Agent');



exports.approvePendingAllocation = async (req, res) => {
  const { id } = req.params;

  
  try {
    const pending = await AllocationRequest.findByPk(id);
    if (!pending || pending.status !== 'pending') {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
      const maxBooking = await Allocation.max('bookingNumber');
      const nextNumber = maxBooking ? parseInt(maxBooking) + 1 : 1;
      bookingNumber = nextNumber.toString().padStart(4, '0');
    // Exclude fields not needed or auto-generated
    const {
      id: _ignoreId,
      createdAt,
      updatedAt,
      status,
      bookingNumber: _ignoreBookingNumber,
      ...allocationData
    } = pending.toJSON();

    // Step 1: Create allocation WITHOUT bookingNumber
    const allocation = await Allocation.create({
      ...allocationData,
      bookingNumber,
      allocationDate: new Date(),
    });


    // Mark request as approved
    pending.status = 'approved';
    await pending.save();

    return res.status(200).json({ message: 'Request approved and plot allocated', allocation });

  } catch (error) {
    console.error("Error approving allocation request:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.denyPendingAllocation = async (req, res) => {
  const { id } = req.params;

  try {
    const pending = await AllocationRequest.findByPk(id);
    if (!pending || pending.status !== 'pending') {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    // Delete the pending allocation request
    await pending.destroy();

    res.status(200).json({ message: 'Request denied and deleted' });
  } catch (error) {
    console.error("Error deleting denied request:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all pending allocation requests (for Admin to review)
exports.getAllPendingRequests = async (req, res) => {
    try {
        const requests = await AllocationRequest.findAll({
            where: { status: 'pending' },
            include: [
            {
                model: Agent,
                as: "agent", // Ensure this matches your association alias
                attributes: ["fullName"], // Fetch only agent's name
                required: false,
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



