const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const OfficeAgent= require('../models/OfficeAgent');
const { Agent } = require('../models');
const { sendResetEmail, sendCredentialsEmail } = require('../utils/emailService'); // Utility for sending emails
require('dotenv').config();

// Generate sequanial Associate Code
const generateAssociateCode = async () => {
  const lastAgent = await OfficeAgent.findOne({
    order: [['id', 'DESC']]
  });

  const nextId = lastAgent ? lastAgent.id + 1 : 1;
  return `OFFICE${String(nextId).padStart(4, '0')}`; 
};
// Register Agent
exports.createOfficeAgent = async (req, res) => {
  try {
    const { fullName, mobileNo, password, email, parentId,adharcard, ...otherDetails } = req.body;
    
    // Check if mobile number is already registered
    const existingAgent = await OfficeAgent.findOne({ where: { mobileNo } });
    if (existingAgent) {
      return res.status(400).json({ field: 'mobileNo', message: 'Mobile number already registered' });
    }

    const adhar=await OfficeAgent.findOne({where:{adharcard}})
    if(adhar){
      return res.status(400).json({ field: 'adharcard',
         message: "Aadhar card already registered",
         toast: `Agent already registered in "${adhar.branch}" branch`
         });
    }

    // Check if email is already registered
    const existingAgentByEmail = await OfficeAgent.findOne({ where: { email } }); 
    if (existingAgentByEmail) {
      return res.status(400).json({ field: 'email', message: 'Email already registered' });
    }

    let validatedParentId = null;

    // If parentId is provided, verify that it exists
    if (parentId) {
      const parentAgent = await OfficeAgent.findByPk(parentId);
      
      if (!parentAgent) {
        return res.status(400).json({ message: 'Parent agent does not exist' });
      }
      validatedParentId = parentId; // Use only if valid
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const associateCode = await generateAssociateCode();

    const joiningDate=new Date();
    // Create new agent
    const newAgent = await OfficeAgent.create({
      associateCode,
      fullName,
      mobileNo,
      email,
      adharcard,
      password: hashedPassword,
      parentId: validatedParentId, // Ensuring it's either a valid ID or NULL
      joiningDate,
      ...otherDetails,
    });

    res.status(201).json({ message: 'Agent registered successfully', agent: newAgent });
  } catch (error) {
    res.status(500).json({ message: 'Error registering agent', error: error.message });
  }
};

// Login Agent
exports.loginofficeAgent = async (req, res) => {
  try {
    const { associateCode, password } = req.body;

    const agent = await OfficeAgent.findOne({ where: { associateCode } });
    if (!agent) {
      return res.status(404).json({ message: 'Invalid AssociateCode or Password' });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid AssociateCode or Password' });
    }
console.log(isMatch);

    const token = jwt.sign({ id: agent.id, associateCode: agent.associateCode }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Login successful', token, agent });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

exports.updateOfficeAgent = async (req, res) => {
  console.log("update route hit");
  
  try{
      const { id } = req.params;
      const { fullName, mobileNo, email, parentId, ...otherDetails } = req.body;
      const agent = await OfficeAgent.findByPk(id);
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      await agent.update({
        fullName,
        mobileNo,
        email,
        parentId: parentId || null, 
        ...otherDetails,
      })
          res.status(200).json({ message: 'Agent updated successfully', agent });
  }catch(error){
      console.error("Error updating agent:", error);
    res.status(500).json({ message: 'Error updating agent', error: error.message });
  }
}

//get agents
exports.getAgents = async (req, res) => {
  try {
    const agents = await OfficeAgent.findAll({
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

    const agent = await OfficeAgent.findByPk(agentId);
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
    const agent = await OfficeAgent.findOne({ where: { email } });
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
    const agent = await OfficeAgent.findOne({ where: { email, resetCode } });

    if (!agent) return res.status(400).json({ message: 'Invalid reset code' });

    agent.password = await bcrypt.hash(newPassword, 10);
    console.log(agent.password);
    
    agent.resetCode = null;
    await agent.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};