const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Allocation = require("./allocation"); // Import Allocation model

const EMIPayment = sequelize.define("EMIPayment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  allocationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Allocation,
      key: "id",
    },
  },
  emiAmountPaid: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  remainingEMIAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  totalEMIRemaining: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentMode: {
    type: DataTypes.ENUM("Cash", "Cheque", "Online"),
    allowNull: false,
  },
  transactionNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Only required for Online/Cheque payments
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  nextDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Completed", "Partially Paid"),
    defaultValue: "Pending",
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  receiptNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'emipayments', 
  timestamps: true, // Enables createdAt and updatedAt fields
});

module.exports = EMIPayment;
