const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance
const Agent = require('./Agent'); // Importing the Agent model

const AgentUpload = sequelize.define('AgentUpload', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Agent,
            key: 'id'
        }
    },
    fieldType: {
        type: DataTypes.ENUM('addressProof', 'identityProof', 'photo', 'signature'),
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

// Run this **only once**, then comment it out after the table is created
// sequelize.sync({ alter: true }) // Use { force: true } ONLY if you want to reset tables
//   .then(() => {
//       console.log('AgentUpload table created successfully');
//   })
//   .catch(err => console.error('Database sync error:', err));

module.exports = AgentUpload;
