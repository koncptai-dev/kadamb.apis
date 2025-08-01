const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Agent = require('../models/Agent');
const commissionLevel = require('../models/CommissionLevel');
const OfficeAgent = require('../models/OfficeAgent');
require('dotenv').config();
const { sendResetEmail, sendCredentialsEmail } = require('../utils/emailService'); // Utility for sending emails

// Generate Random Associate Code

const generateAssociateCode = async () => {
  const lastAgent = await Agent.findOne({
    order: [['id', 'DESC']]
  });

  const nextId = lastAgent ? lastAgent.id + 1 : 1;
  return `AGENT${String(nextId).padStart(4, '0')}`; 
};

exports.registerAgent = async (req, res) => {
  try {
    const { fullName, mobileNo, password, email, parentId, commissionLevelId, ...otherDetails } = req.body;
    let agentCode = null;
    let officeId = null;

    if (req.user?.associateCode?.startsWith('OFFICE')) {
      officeId = req.user.id;
      const officeAgent = await OfficeAgent.findByPk(officeId);

      if (!officeAgent) {
        return res.status(400).json({ message: 'OfficeAgent not found' });
      }

      const officeCode = officeAgent.associateCode.replace('OFFICE', '').padStart(4, '0');

      const agentCount = await Agent.count({ where: { officeId } });
      const paddedAgentNumber = String(agentCount + 1).padStart(3, '0'); // e.g. 001
      agentCode = `${officeCode}1${paddedAgentNumber}`; 

    }
      
    // Validate commissionLevelId presence
    if (!commissionLevelId) {
      return res.status(400).json({ field:"commissionLevelId",message: 'Commission level ID is required' });
    }
    // Check if commissionLevelId exists in DB
    const commissionLevelRecord = await commissionLevel.findByPk(commissionLevelId);
    if (!commissionLevelRecord) {
      return res.status(400).json({ field:"commissionLevelId",message: 'Invalid commission level ID' });
    }
    const commissionPercentage = commissionLevelRecord.commissionPercentage;

    // Check mobile/email duplicate etc. (your existing code)
    const existingAgent = await Agent.findOne({ where: { mobileNo } });
    if (existingAgent) {
      return res.status(400).json({field:"mobileNo", message: 'Mobile number already registered' });
    }

    const existingAgentByEmail = await Agent.findOne({ where: { email } });
    if (existingAgentByEmail) {
      return res.status(400).json({field:"email", message: 'Email already registered' });
    }

    let validatedParentId = null;
    if (parentId) {
      const parentAgent = await Agent.findByPk(parentId);
      if (!parentAgent) {
        return res.status(400).json({field:"parentId", message: 'Parent agent does not exist' });
      }
      validatedParentId = parentId;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const associateCode = await generateAssociateCode();

    // Create new agent
    const newAgent = await Agent.create({
      associateCode,
      agentCode,
      officeId,
      fullName,
      mobileNo,
      email,
      password: hashedPassword,
      parentId: validatedParentId,
      commissionPercentage,
      commissionLevelId, // save commissionLevelId if you want
      ...otherDetails,
    });

    

    await sendCredentialsEmail(email, associateCode, password);

    return res.status(201).json({ message: 'Agent registered successfully. Credentials sent to email.', agent: newAgent });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering agent', error: error.message });
  }
};

// Login Agent
exports.loginAgent = async (req, res) => {
  try {
    const { associateCode, password } = req.body;

    const agent = await Agent.findOne({ where: { associateCode } });
    if (!agent) {
      return res.status(404).json({ message: 'Invalid AssociateCode or Password' });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid AssociateCode or Password' });
    }

    const token = jwt.sign({ id: agent.id, associateCode: agent.associateCode }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Login successful', token, agent });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};  

// Edit Agent Info
exports.editAgent = async (req, res) => {
  try {
    const { id } = req.params; // Extract agent ID from token
    const updates = req.body;

    // Prevent replacing existing values with null
    const existingAgent = await Agent.findByPk(id);
    if (!existingAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (updates.commissionLevelId) {
    const level = await commissionLevel.findByPk(updates.commissionLevelId);
    if (!level) {
      return res.status(400).json({ message: 'Invalid commission level ID' });
    }

   
    if (level.commissionPercentage < existingAgent.commissionPercentage) {
      return res.status(400).json({ 
        field: "commissionPercentage",
        message: `Cannot update. Current percentage is higher.`
      });
    }

    updates.commissionPercentage = level.commissionPercentage;
    delete updates.commissionLevelId;
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
      existingAgent[key] = updates[key];
    }
  });


    await existingAgent.save();
    res.status(200).json({ message: 'Agent updated successfully', agent: existingAgent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating agent', error: error.message });
  }
};

// Change Password

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const agentId = req.user.id; // Extract agent ID from JWT token

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password must match" });
    }

    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, agent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await agent.update({ password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};

// Forgot Password - Send Reset Code
exports.sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const agent = await Agent.findOne({ where: { email } });
    if (!agent) return res.status(404).json({ message: 'Email not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    agent.resetCode = resetCode;
    await agent.save();

    await sendResetEmail(email, resetCode); // Send reset email
    res.status(200).json({ message: 'Reset code sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset code', error: error.message });
  }
};

// Forgot Password - Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    const agent = await Agent.findOne({ where: { email, resetCode } });

    if (!agent) return res.status(400).json({ message: 'Invalid reset code' });

    agent.password = await bcrypt.hash(newPassword, 10);
    agent.resetCode = null;
    await agent.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};


// Get Agent Profile
exports.getAgentProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extract agent ID from JWT token

    const agent = await Agent.findByPk(id, {
      attributes: { exclude: ['password', 'resetCode'] } // Exclude sensitive data
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.status(200).json({ message: "Agent profile retrieved", agent });
  } catch (error) {
    res.status(500).json({ message: "Error fetching agent profile", error: error.message });
  }
};


exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll({
      attributes: { exclude: ['password', 'resetCode'] }, // Exclude sensitive data
    });

    if (!agents || agents.length === 0) {
      return res.status(404).json({ message: "No agents found" });
    }

    res.status(200).json({ message: "Agents retrieved successfully", agents });
  } catch (error) {
    res.status(500).json({ message: "Error fetching agents", error: error.message });
  }
};

//get subagent by agentid
exports.getAgentwithSubAgent=async(req,res)=>{
  try {
    const { id } = req.params;
    
    // Find all sub-agents where parentId matches the given agentId
    const subAgents = await Agent.findAll({
      where: { parentId: id }
    });

    if (subAgents.length === 0) {
      return res.status(404).json({ message: "No sub-agents found for this agent" });
    }
    res.json({
      message: "Sub-agents retrieved successfully",
      agentId: id,
      subAgents: subAgents.map(({ id, fullName, email, mobileNo, associateCode, city, state, status, introCode, createdAt, updatedAt }) => ({
        id, fullName, email, mobileNo, associateCode, city, state, status, introCode, createdAt, updatedAt
      })),
    });
  } catch (error) {
    console.error("Error retrieving sub-agents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.getAllSubAgents = async (req, res) => {
  try{
    const Agents=await Agent.findAll({
      where:{
        parentId: {[Op.ne]: null},//op.ne  stands not equal to  null
      }
    });
    if (!Agents.length) return res.status(404).json({ message: 'No sub-agents found' });

    res.status(200).json({ success: true, Agents });
  } catch (error) {
    console.error('Error fetching sub-agents:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findByPk(id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    await agent.destroy();
    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting agent ', error: error.message });
  }
}