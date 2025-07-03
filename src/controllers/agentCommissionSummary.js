const AgentCommission=require('../models/AgentCommission');
const AgentCommissinTracker=require('../models/AgentCommissionTracker');
const WalletTransfer=require('../models/WalletFundTransfer');
const AgentReward=require('../models/AgentCircularReward');
const { Op } = require('sequelize');

exports.getAgentCommissionSummary = async (req, res) => {
    try{
        const agentId=req.user.id;

        const totalCommission = await AgentCommission.sum('commissionAmount', {
            where:{agentId}
        })
        // const afterTransfredCommission = await AgentCommission.sum('commissionAmount', {
        //     where: {  agentId  }
        // })

        const WalletTransferAmount = await WalletTransfer.sum('amount', {
            where: {
                agentId,
                status:'approved'
            }
        });
        const RewardAmount= await AgentReward.sum('rewardAmount', {
            where: {agentId}
        });
        
        res.json({
                success: true,
                data: {
                    totalCommission: totalCommission || 0,
                    // afterTransfredCommission: afterTransfredCommission || 0,
                    transferredAmount: WalletTransferAmount || 0,
                    rewardedAmount: RewardAmount || 0,
                }       
        }); 
    } catch (err) {
            console.error('Error fetching commission summary:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
};