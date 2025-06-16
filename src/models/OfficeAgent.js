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
      model: 'OfficeAgents', // ✅ model name (not table name)
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
    validate: { len: [10, 15] },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  joiningDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fullName: DataTypes.STRING,
  dob: DataTypes.DATEONLY,
  age: DataTypes.INTEGER,
  gender: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  address: DataTypes.TEXT,
  pinNo: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
  resetCode: DataTypes.STRING,
}, {
  tableName: 'officeagents',   // ✅ ensure correct table mapping
  timestamps: true,
});

module.exports = OfficeAgent;