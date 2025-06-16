  const { DataTypes } = require("sequelize");
  const sequelize = require("../config/database");
const Agent = require("./Agent");  // Import the Agent model

  const AllocationRequest = sequelize.define("AllocationRequest", {
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
    customerAge: DataTypes.INTEGER,
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
    },
    customerPAN: {
      type: DataTypes.STRING(10),
      allowNull: false,
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
    downPayment: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
    status: {
      type: DataTypes.ENUM('pending', 'approved'),
      allowNull: false,
      defaultValue: 'pending',
    }
  },

  {
    timestamps: true,
    tableName: "allocation_requests", 
  });


  module.exports = AllocationRequest;
