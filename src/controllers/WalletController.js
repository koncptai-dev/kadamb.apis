const walletTransfer=require('../models/WalletFundTransfer');
const AgentCommission = require('../models/AgentCommission');
require('dotenv').config();

//create wallet fund
exports.transferWallet = async (req, res) => {
  
  try {
    const { agentId, amount, requestFor, remarks, bankName, branchName, accountNumber } = req.body;

    // Fetch the agent's commission from the AgentCommission table
    const agentCommission = await AgentCommission.findOne({ where: { agentId } }); 

    if (!agentCommission) {
      return res.status(404).json({ message: 'Agent not found in commission table' });
    }
    const commissionAmount = agentCommission ? parseFloat(agentCommission.commissionAmount) : 0.0;

    // Calculate the updated balance 
    const updatedBalance =   commissionAmount - parseFloat(amount);
    console.log(updatedBalance);
console.log(amount);

    if (updatedBalance < 0) {
      console.log('Insufficient balance. Transaction cannot proceed.');
      return res.status(400).json({
        message: 'Insufficient balance. Transaction cannot proceed.',
        availableBalance: commissionAmount, // Informing the user about their actual balance
      });
      
    }
    // Backend validation
    if (requestFor === 'Bank Transfer' && (!bankName || !accountNumber || !branchName)) {
      return res.status(400).json({ error: 'Bank Name and Account Number are required for Bank Transfer.' });
    }

    // Create a wallet transaction
    const walletTransaction = await walletTransfer.create({
      agentId,
      balance: parseInt(updatedBalance),
      amount: parseFloat(amount),
      commission: commissionAmount,
      requestFor,
      remarks,
      bankName:bankName || null,
      branchName:branchName || null,  
      accountNumber:accountNumber || null,
    });


    //update comission amount in agent comission table
    await AgentCommission.update(
      { commissionAmount: updatedBalance }, 
      { where: { agentId } }
    );



    return res.status(201).json({
      message: 'Wallet transaction created successfully',
      data: walletTransaction,
    });
  } catch (error) {
    console.error('Error creating wallet transaction:', error);
    return res.status(500).json({ message: 'Failed to create wallet transaction', error });
  }
}

exports.getBalance= async (req, res) => {
    try{
        const{ agentId } = req.params;
        console.log(agentId);
        
        const agentCommission = await AgentCommission.findOne({ where: { agentId } });
        // console.log(agentCommission);

        if(!agentCommission){
            return res.status(404).json({ message: 'Agent not found' });
        }
        const balance=agentCommission.commissionAmount; 
        console.log(balance);
          
        return res.status(200).json({balance});
    }catch(error){
        console.error('Error fetching wallet balance:', error);
        return res.status(500).json({ message: 'Failed to fetch wallet balance', error });
    }
}

// get all wallet fund
exports.getWalletFund=async(req,res)=>{
  try{
    const wallets=await walletTransfer.findAll({
      order:[['createdAt','DESC']],
    })
    if(!wallets){
      return res.status(404).json({message:'No Wallet Fund Found'});
    }
    res.status(200).json(wallets);
  }catch(error){
    console.error('Error fetching wallet fund:', error);
    return res.status(500).json({ message: 'Failed to fetch wallet fund', error });
  }
}

//edit wallet fund
exports.editWalletFund = async (req, res) => {
  try {
    const { id } = req.params; // Extract transaction ID from request parameters
    const updates = req.body;

    // Find the wallet transaction by ID
    const existingTransaction = await walletTransfer.findByPk(id);
    if (!existingTransaction) {
      return res.status(404).json({ message: 'Wallet transaction not found' });
    }

    // Prevent replacing existing values with null, undefined, or empty string
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
        existingTransaction[key] = updates[key];
      }
    });

    await existingTransaction.save();
    res.status(200).json({ message: 'Wallet transaction updated successfully', transaction: existingTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wallet transaction', error: error.message });
  }
};
