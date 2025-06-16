// models/AgentCommissionTracker.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

  const AgentCommissionTracker = sequelize.define("AgentCommissionTracker", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        agentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        allocationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        commissionAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "agent_commission_tracker",
        timestamps: false
    });

    module.exports = AgentCommissionTracker;
