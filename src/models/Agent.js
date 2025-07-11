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
      model: 'agents', // Self-referencing association
      key: 'id',
    },
  },
  commissionLevelId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'commissionlevels', // Links to commission table
      key: 'id',
    },
    allowNull: false
  },
  commissionPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true, // This will store the commissionPercentage from CommissionLevels
  },
  associateCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
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
  nomineeAge: {type:DataTypes.INTEGER,allowNull: true},
 
  resetCode: DataTypes.STRING, // Used for forgot password functionality
  photoUrl: {
  type: DataTypes.STRING,
  allowNull: true,
},
signatureUrl: {
  type: DataTypes.STRING,
  allowNull: true,
},
addressProofUrl: {
  type: DataTypes.STRING,
  allowNull: true,
},
identityProofUrl: {
  type: DataTypes.STRING,
  allowNull: true,
},
agentCode:{
  type:DataTypes.STRING,
  allowNull:true
},
 officeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'officeagents',
        key: 'id',
      },
    },
}, {
  timestamps: true,
  tableName: 'agents', 
});

module.exports = Agent; 

