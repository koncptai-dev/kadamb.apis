const Agent = require('../models/Agent');
const OfficeAgent = require('../models/OfficeAgent');
const AgentCommission = require('../models/AgentCommission');
const walletTransfer = require('../models/WalletFundTransfer');

exports.transferWalletByOffice = async (req, res) => {
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
    const newCommissionAmount = commissionAmount - requestedAmount; 
    console.log(`New Commission Amount after deduction: ${newCommissionAmount}`);
    
    agentCommission.commissionAmount = newCommissionAmount;
    await agentCommission.save();
    
    if (requestFor === 'Bank Transfer' && (!bankName || !accountNumber || !branchName)) {
      return res.status(400).json({ error: 'Bank Name, Branch Name, and Account Number are required for Bank Transfer.' });
    }

    const transactionNumber = `TRN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const walletTransaction = await walletTransfer.create({
      associateCode,
      transactionNumber,
      agentId,
      balance: newCommissionAmount, 
      amount: requestedAmount,
      commission: commissionAmount,
      requestFor,
      remarks,
      bankName: bankName || null,
      branchName: branchName || null,
      accountNumber: accountNumber || null,
      requestDate: new Date(),
      payDate: null,
      status: 'Approved',
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

exports.getAgentsByOffice = async (req, res) => {
  try {
    const officeId = req.user.id; // from OfficeAgent's token
    const agents = await Agent.findAll({
      where: { officeId },
      attributes: ['id', 'associateCode', 'fullName'],
    });

    res.status(200).json(agents);
  } catch (error) {
    console.error('Error fetching agents for office:', error);
    res.status(500).json({ message: 'Failed to fetch agents', error });
  }
};

exports.getBalanceByOffice= async (req, res) => {
    try{
        const{ agentId } = req.params;
        
        const agentCommission = await AgentCommission.findOne({ where: { agentId } });
        const balance = agentCommission ? agentCommission.commissionAmount : 0;
          
        return res.status(200).json({balance});
        }catch(error){
        console.error('Error fetching wallet balance:', error);
        return res.status(500).json({ message: 'Failed to fetch wallet balance', error });
    }
}