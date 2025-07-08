const CommissionLevel = require('../models/CommissionLevel');

//  Add a Commission Level
exports.addCommissionLevel = async (req, res) => {
  try {
    const { level, commissionPercentage } = req.body;

    //validation 
    if(commissionPercentage < 0 || commissionPercentage>100){
      return res.status(400).json({ message: 'Commission percentage cannot be more than 100% or negative' });
    }
    const exsitscommissionLevels = await CommissionLevel.findOne({ where: { level } });
    if (exsitscommissionLevels) {
      return res.status(400).json({ message: 'Commission Level already exists' });
    }
    const commissionLevel = await CommissionLevel.create({ level, commissionPercentage });
    res.status(201).json({ message: 'Commission Level added successfully', commissionLevel });
  } catch (error) {
    res.status(500).json({ message: 'Error adding Commission Level', error: error.message });
  }
};

//  Get All Commission Levels
exports.getAllCommissionLevels = async (req, res) => {
  try {
    const commissionLevels = await CommissionLevel.findAll();
    res.status(200).json(commissionLevels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Commission Levels', error: error.message });
  }
};

//  Get a Single Commission Level by ID
exports.getCommissionLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const commissionLevel = await CommissionLevel.findByPk(id);
    if (!commissionLevel) return res.status(404).json({ message: 'Commission Level not found' });
    
    res.status(200).json(commissionLevel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Commission Level', error: error.message });
  }
};

// Update a Commission Level
exports.updateCommissionLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, commissionPercentage } = req.body;

    const commissionLevel = await CommissionLevel.findByPk(id);
    if (!commissionLevel) {
      return res.status(404).json({ message: 'Commission Level not found' });
    }

    // Validate commissionPercentage if provided
    if (
      commissionPercentage !== undefined &&
      (isNaN(commissionPercentage) || commissionPercentage < 0 || commissionPercentage > 100)
    ) {
      return res.status(400).json({
        message: 'Commission percentage must be between 0 and 100',
      });
    }

    // Prepare update object dynamically
    const updateData = {};

    if (level !== undefined) updateData.level = level;
    if (commissionPercentage !== undefined) updateData.commissionPercentage = commissionPercentage;

    // Perform the update
    await commissionLevel.update(updateData);

    res.status(200).json({
      message: 'Commission Level updated successfully',
      commissionLevel,
    });
  } catch (error) {
    console.error("Error updating commission level:", error);
    res.status(500).json({
      message: 'Error updating Commission Level',
      error: error.message,
    });
  }
};
//  Delete a Commission Level
exports.deleteCommissionLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const commissionLevels = await CommissionLevel.findByPk(id);
    if (!commissionLevels) return res.status(404).json({ message: 'Commission Level not found' });

    await commissionLevels.destroy();
    res.status(200).json({ message: 'Commission Level deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Commission Level', error: error.message });
  }
};
