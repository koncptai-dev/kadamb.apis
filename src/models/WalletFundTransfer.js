const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize instance
const AgentCommission = require('./AgentCommission'); 

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
    
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    tableName: 'wallet_transfer',
  }
);

module.exports = Wallet;
