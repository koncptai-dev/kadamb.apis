// models/AgentCommission.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

    const AgentCommission = sequelize.define("AgentCommission", {
        agentId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        commissionAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "agent_commission",
        timestamps: false
    });

module.exports = AgentCommission;
