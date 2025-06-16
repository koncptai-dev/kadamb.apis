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
<<<<<<< HEAD
  tableName: 'commission_levels'
=======
>>>>>>> 3dfa10798d5a344c2dfa09785c093ea62292b377
});

module.exports = CommissionLevel;
