const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Plot = sequelize.define("Plot", {
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
    width: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  plotSize: {
    type: DataTypes.FLOAT,
    allowNull: false,
   
  },
  yard: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  plotNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
   
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
   
  },
  status: {
    type: DataTypes.ENUM("Available", "Hold", "Sold"),
    allowNull: false,
    defaultValue: "Available",
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    
  },
  downPayment: {
    type: DataTypes.FLOAT,
    allowNull: true,
   
  },
  emiDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
   
  },
  emiAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // latitude: {
  //   type: DataTypes.FLOAT,
  //   allowNull: true,
   
  // },
  // longitude: {
  //   type: DataTypes.TEXT,
  //   allowNull: true,
  // },
  // imageUrl: {
  //   type: DataTypes.TEXT,
  //   allowNull: true,
  // },
}, {
  timestamps: false,
  tableName: "plots",
});

module.exports = Plot;
