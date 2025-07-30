const CommissionChart = require('../models/CommissionChart'); 
const { Op } = require('sequelize');

exports.CreateCommissionChart = async (req, res) => {
    try{
        const {rank,target,commissionPercent,startDate,endDate,increaseAfterDays,increaseFrom} = req.body;

        const exists=await CommissionChart.findOne({ where: { rank } });
        if (exists) {
            return res.status(400).json({ success: false, message: " Rank is already exists" });
        }
        const commissionChart = await CommissionChart.create({
            rank,
            target,
            commissionPercent,
            startDate,
            endDate,
            increaseAfterDays,
            increaseFrom
        })
        res.status(201).json({ message: 'CircularRank added successfully', data: commissionChart });

    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }

}

exports.getAllCommissionCharts = async (req, res) => {
    try {
        const commissionCharts = await CommissionChart.findAll();
        res.status(200).json(commissionCharts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Commission Charts', error: error.message });
    }
}

exports.updateCommissionCharts=async(req,res)=>{

    try{
        const {id}=req.params;
        const {rank,target,commissionPercent,startDate,endDate,increaseAfterDays,increaseFrom} = req.body;

        const commissionChart = await CommissionChart.findByPk(id);
        if (!commissionChart) {
        return res.status(404).json({ message: 'Commission Rank not found' });
        }

        const existRank = await CommissionChart.findOne({
        where: {
            rank,
            id: { [Op.ne]: id } 
        }
    });
    if (existRank) {
      return res.status(400).json({ message: 'Rank is already exists' });
    }
        await commissionChart.update({
            rank: rank ?? commissionChart.rank,
            target: target ?? commissionChart.target,
            commissionPercent: commissionPercent ?? commissionChart.commissionPercent,
            startDate: startDate ?? commissionChart.startDate,
            endDate: endDate ?? commissionChart.endDate,
            increaseAfterDays: increaseAfterDays ?? commissionChart.increaseAfterDays,
            increaseFrom: increaseFrom ?? commissionChart.increaseFrom
        });
        res.status(200).json({ success: true, message: 'Commission Chart updated successfully', data: commissionChart });
    } catch (error) {
        console.error("Error updating Commission Chart:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }

}

exports.deleteCommissionCharts=async(req,res)=>{
    try{     
        const {id} =req.params;
        const commissionRank=await CommissionChart.findByPk(id);
        if(!commissionRank){
        return res.status(404).json({ message: 'Commission Rank not found' });
        }
        await commissionRank.destroy()
            res.status(200).json({ success: true, message: 'commission Rank  deleted successfully' });
  }catch (error) {
    console.error("Error deleting commission Rank:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}   