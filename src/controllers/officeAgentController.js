const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const OfficeAgent= require('../models/OfficeAgent');
const { Agent } = require('../models');

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
    const { fullName, mobileNo, password, email, parentId, ...otherDetails } = req.body;
    
    // Check if mobile number is already registered
    const existingAgent = await OfficeAgent.findOne({ where: { mobileNo } });
    if (existingAgent) {
      return res.status(400).json({ field: 'mobileNo', message: 'Mobile number already registered' });
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

    const token = jwt.sign({ id: agent.id, associateCode: agent.associateCode }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Login successful', token, agent });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

exports.updateOfficeAgent = async (req, res) => {
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
  }catch{
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
