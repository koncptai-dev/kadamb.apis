const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //  Import Sequelize Instance

const OfficeAgent = sequelize.define('OfficeAgent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'officeagents', 
      key: 'id',
    },
  },
  associateCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  mobileNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
  },
  fullName: DataTypes.STRING,
  dob: DataTypes.DATEONLY,
  age: DataTypes.INTEGER,
  gender: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  address: {type:DataTypes.TEXT,allowNull:false},
  pinNo: {type:DataTypes.STRING,allowNull:false},
  resetCode: DataTypes.STRING,
  branch:DataTypes.STRING,
  adharcard: {
    type:DataTypes.STRING(12),
    allowNull: false,
  },
  
}, {
  tableName: 'officeagents',   //  ensure correct table mapping
  timestamps: true,
});

module.exports = OfficeAgent;