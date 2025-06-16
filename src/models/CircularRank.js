const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import Sequelize Instance

const CircularRank = sequelize.define('CircularRank', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, //  Set this as the primary key
  },
  name:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  target_amount:{
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  reward_amount:{
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  rank_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, //  Ensure level is unique, but NOT primary key
  },
 
}, {
  timestamps: false,
  tableName: 'circular_ranks'
});

module.exports = CircularRank;
