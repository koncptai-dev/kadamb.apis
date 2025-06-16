const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize instance
const AgentCommission = require('./AgentCommission'); 
const Agent = require('./Agent'); // Assuming you have an Agent model
const { request } = require('express');

const Wallet = sequelize.define(
  'wallet_transfer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agentId: {
      type: DataTypes.INTEGER,
      references: {
        model: AgentCommission, 
        key: 'agentId', 
      },  
    },
  associateCode:{
    type: DataTypes.STRING,
    allowNull: true,
  },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status:{
      type: DataTypes.ENUM('Pending', 'Approved'),
      defaultValue: 'Pending',
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    requestFor: {
      type: DataTypes.ENUM('Cash', 'Bank Transfer', 'Installment Payment'),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branchName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionNumber:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    requestDate: {
      type:DataTypes.DATE,
      allowNull: true,
    },
    payDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    tableName: 'wallet_transfer',
  }
);


module.exports = Wallet;
