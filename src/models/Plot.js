const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Plot = sequelize.define("Plot", {
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
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
    validate: {
      min: 1,
    },
  },
  yard: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  plotNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
    validate: {
      notEmpty: true,
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  status: {
    type: DataTypes.ENUM("Available", "Hold", "Sold"),
    allowNull: false,
    defaultValue: "Available",
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
    }
  },
  downPayment: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      isLessThanPrice(value) {
        if (value && this.price && value > this.price) {
          throw new Error("Down payment cannot be greater than price");
        }
      },
    },
  },
  emiDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
    },
  },
  emiAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: "plots",
});

module.exports = Plot;
