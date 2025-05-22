const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ✅ Import Sequelize Instance

const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Root agents will have NULL
    references: {
      model: 'Agents', // Self-referencing association
      key: 'id',
    },
  },
  commissionLevelId: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // Top-level agents start at Level 1
    references: {
      model: 'CommissionLevels', // Links to commission table
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
  fatherHusbandName: DataTypes.STRING,
  dob: DataTypes.DATEONLY,
  age: DataTypes.INTEGER,
  gender: DataTypes.STRING,
  introCode: DataTypes.STRING,
  introName: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  address: DataTypes.TEXT,
  pinNo: DataTypes.STRING,
  bankName: DataTypes.STRING,
  branchName: DataTypes.STRING,
  ifscCode: DataTypes.STRING,
  accountNo: DataTypes.STRING,
  panNoStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  panCardNo: DataTypes.STRING,
  occupation: DataTypes.STRING,
  nomineeName: DataTypes.STRING,
  nomineeRelation: DataTypes.STRING,
  nomineeAge: DataTypes.INTEGER,
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
  resetCode: DataTypes.STRING, // Used for forgot password functionality
}, {
  timestamps: true,
});

module.exports = Agent; // ✅ Correct Export
