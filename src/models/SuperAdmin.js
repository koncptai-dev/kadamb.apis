const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Import DB connection
const bcrypt = require("bcryptjs"); 
const SuperAdmin = sequelize.define(
  "SuperAdmin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (superAdmin) => {
        const salt = await bcrypt.genSalt(10);
        superAdmin.password = await bcrypt.hash(superAdmin.password, salt);
      },
    },
    tableName: "superadmins", 

  }
);

module.exports = SuperAdmin;
