const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import Sequelize Instance

const CommissionChart = sequelize.define('CommissionChart', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, //  Set this as the primary key
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, //  Ensure level is unique, but NOT primary key
  },
  target:{
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  commissionPercent:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  increaseAfterDays:{
    type:DataTypes.INTEGER,
    allowNull: false,
  },
  increaseFrom: {
  type: DataTypes.ENUM('end', 'achieved'), // 'end' = from endDate, 'achieved' = from achievedOn
  defaultValue: 'end',
},
}, {
  timestamps: true,
  tableName: 'commission_charts'
});

module.exports = CommissionChart;
