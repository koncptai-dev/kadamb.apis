const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

  const AgentCircularReward = sequelize.define("AgentCircularReward", {
    agentId: DataTypes.INTEGER,
    circularId: DataTypes.INTEGER,
    payoutNumber: DataTypes.STRING,
    circularName: DataTypes.STRING,
    rankLevel: DataTypes.STRING,
    target: DataTypes.FLOAT,
    rewardAmount: DataTypes.FLOAT,
    status: DataTypes.STRING,
    selfIncome: DataTypes.FLOAT,
    teamIncome: DataTypes.FLOAT,
    remainingTeamIncome: DataTypes.FLOAT
    
  },{
  timestamps: true,
  tableName: 'agents_circular_rewards', 
});
  
module.exports = AgentCircularReward;
