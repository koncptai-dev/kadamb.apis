const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust path as needed

const Allocation = sequelize.define("Allocation", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerAge:{
    type: DataTypes.INTEGER 
   } ,
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  customerMobile: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },  
  customerGender: {
    type: DataTypes.ENUM("Male", "Female", "Other"),
    allowNull: false,
  },
  customerAadhar: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
  },
  customerPAN: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  nomineeName: DataTypes.STRING,
  nomineeRelation: DataTypes.STRING,
  nomineeAge: DataTypes.INTEGER,
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ifscCode: {
    type: DataTypes.STRING(11),
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plotSize: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plotNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentType: {
    type: DataTypes.ENUM("Cash", "EMI"),
    allowNull: false,
  },
  emiMonthly: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  emiDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
   downPayment:{
      type:DataTypes.FLOAT,
      allowNull:true,
    },
  emiStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emiEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
 nextDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  allocationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  remainingEmiAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  remainingEmi: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  bookingNumber: {
  type: DataTypes.STRING,
  allowNull: true,
  unique: true,
},
},
{
  tableName: "allocations",
  timestamps: true, 
});

module.exports = Allocation;
