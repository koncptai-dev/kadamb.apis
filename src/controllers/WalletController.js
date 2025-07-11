const walletTransfer=require('../models/WalletFundTransfer');
const AgentCommission = require('../models/AgentCommission');
const Agent = require('../models/Agent');
const OfficeAgent = require('../models/OfficeAgent');

require('dotenv').config();


// transferWallet
exports.transferWallet = async (req, res) => {
  try {
    const { agentId, amount, requestFor, remarks, bankName, branchName, accountNumber } = req.body;

    const agent = await Agent.findOne({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const associateCode = agent.associateCode;
    if (!associateCode) {
      return res.status(400).json({ message: 'Associate code is missing for this agent' });
    }

    const agentCommission = await AgentCommission.findOne({ where: { agentId } });
    if (!agentCommission) {
      return res.status(404).json({ message: 'Agent not found in commission table' });
    }

    const commissionAmount = parseFloat(agentCommission.commissionAmount || 0);
    const requestedAmount = parseFloat(amount);

    if (requestedAmount > commissionAmount) {
      return res.status(400).json({
        message: 'Insufficient balance. Transaction cannot proceed.',
        availableBalance: commissionAmount,
      });
    }

    if (requestFor === 'Bank Transfer' && (!bankName || !accountNumber || !branchName)) {
      return res.status(400).json({ error: 'Bank Name, Branch Name, and Account Number are required for Bank Transfer.' });
    }

    const transactionNumber = `TRN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const walletTransaction = await walletTransfer.create({
      associateCode,
      transactionNumber,
      agentId,
      balance: commissionAmount, // not updated yet
      amount: requestedAmount,
      commission: commissionAmount,
      requestFor,
      remarks,
      bankName: bankName || null,
      branchName: branchName || null,
      accountNumber: accountNumber || null,
      requestDate: new Date(),
      payDate: null,
      status: 'Pending',
    });

    return res.status(201).json({
      message: 'Wallet transfer request submitted successfully. Awaiting admin approval.',
      data: walletTransaction,
    });
  } catch (error) {
    console.error('Error creating wallet transaction:', error);
    return res.status(500).json({ message: 'Failed to create wallet transaction', error });
  }
};

exports.getBalance= async (req, res) => {
    try{
        const{ agentId } = req.params;
        
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

    const{ agentId } = req.params;
        
    const wallets=await walletTransfer.findAll(
      { where: { agentId } }
    )

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


//get pending wallet fund request 
exports.getPendingWalletRequests = async (req, res) => {
  try {
    const requests = await walletTransfer.findAll({
      where: { status: 'Pending' },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
};

exports.updateWalletStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await walletTransfer.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'Approved') {
      return res.status(400).json({ message: 'Request is already approved' });
    }

    // Deduct commission only on approval
    if (status === 'Approved') {
      const agentCommission = await AgentCommission.findOne({ where: { agentId: request.agentId } });
      if (!agentCommission) {
        return res.status(404).json({ message: 'Agent commission record not found' });
      }

      const currentCommission = parseFloat(agentCommission.commissionAmount || 0);
      const deductionAmount = parseFloat(request.amount);

      if (deductionAmount > currentCommission) {
        return res.status(400).json({ message: 'Insufficient commission balance at approval time.' });
      }

      const newBalance = currentCommission - deductionAmount;

      // Update commission balance
      await AgentCommission.update(
        { commissionAmount: newBalance },
        { where: { agentId: request.agentId } }
      );

      // Update request status and pay date
      await request.update({
        status: 'Approved',
        payDate: new Date(),
        balance: newBalance, // store updated balance
      });
    }

    res.status(200).json({ message: `Request ${status.toLowerCase()} successfully`, request });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status', error });
  }
};


exports.deleteWalletRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await walletTransfer.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await request.destroy();
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Failed to delete request', error });
  }
};
