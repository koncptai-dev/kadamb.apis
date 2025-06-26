const CircularRank = require('../models/CircularRank');
const { Op } = require('sequelize');

exports.createCircularRank = async (req, res) => {
    try {
        const { name, target_amount, reward_amount, rank_level } = req.body;
        // Validate input
        if (!name || !target_amount || !reward_amount || !rank_level) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // Create new CircularRank entry
        const circularRank = await CircularRank.create({
            name,
            target_amount,
            reward_amount,
            rank_level
        });
        res.status(201).json({ message: 'CircularRank added successfully', data: circularRank });
    } catch (error) {
        console.error("Error creating CircularRank:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

exports.getCircularRanks = async (req, res) => {
    try{
        const circularRank=await CircularRank.findAll()
        res.status(200).json(circularRank);
        } catch (error) {
                res.status(500).json({ message: 'Error fetching Commission Levels', error: error.message });
        }
};

exports.updateCircularRank = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target_amount, reward_amount, rank_level } = req.body;

    const circularRank = await CircularRank.findByPk(id);
    if (!circularRank) {
      return res.status(404).json({ message: 'Circular Rank not found' });
    }

    await CircularRank.update(
      { name, target_amount, reward_amount, rank_level },
      { where: { id } }
    );

    res.status(200).json({ message: 'Rank updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating Rank Level', error: error.message });
  }
};

exports.DeleteCircularRank = async (req, res) => {

  try{
    const {id} =req.params;
    const circularRanks=await CircularRank.findByPk(id);
    if(!circularRanks){
      return res.status(404).json({ message: 'Circular Rank not found' });
    }
    await circularRanks.destroy()
        res.status(200).json({ success: true, message: 'Circular Rank deleted successfully' });

  }catch (error) {
    console.error("Error deleting Circular Rank:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}