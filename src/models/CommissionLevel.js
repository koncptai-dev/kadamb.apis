const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ✅ Import Sequelize Instance

const CommissionLevel = sequelize.define('CommissionLevel', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, // ✅ Set this as the primary key
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // ✅ Ensure level is unique, but NOT primary key
  },
  commissionPercentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'commission_levels'
});

module.exports = CommissionLevel;
