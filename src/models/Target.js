const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Target = sequelize.define('Target', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  agent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamTarget: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalTarget: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  selfBusiness: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teamBusiness: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalBusiness: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  remainingBusiness: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  targetAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },


}, {
  timestamps: true,
<<<<<<< HEAD
  tableName: 'targets',
=======
>>>>>>> 3dfa10798d5a344c2dfa09785c093ea62292b377
});

module.exports = Target;
