const sequelize = require("../config/database");

const Allocation = require("./allocation");
const EMIPayment = require("./emipayment");
const Agent = require("./Agent");
const AgentCommission = require("./AgentCommission");
const AgentCommissionTracker = require("./AgentCommissionTracker");
const Target = require("./Target");
const CommissionLevel = require("./CommissionLevel");
const Wallet = require("./WalletFundTransfer");
const AllocationRequest = require("./AllocationRequest");

// Define associations after initializing both models
Allocation.hasMany(EMIPayment, { foreignKey: "allocationId", as: "payments" });
EMIPayment.belongsTo(Allocation, { foreignKey: "allocationId", as: "allocation" });

Allocation.belongsTo(Agent, { foreignKey: "agentId", as: "agent" });
Agent.hasMany(Allocation, { foreignKey: "agentId", as: "allocations" });

Agent.hasOne(AgentCommission, { foreignKey: "agentId", as: "commission" });
AgentCommission.belongsTo(Agent, { foreignKey: "agentId", as: "agent" });

AgentCommissionTracker.belongsTo(Agent, { foreignKey: "agentId", as: "agent" });
Agent.hasMany(AgentCommissionTracker, { foreignKey: "agentId", as: "commissionHistory" });

AgentCommissionTracker.belongsTo(Allocation, { foreignKey: "allocationId", as: "allocation" });
Allocation.hasMany(AgentCommissionTracker, { foreignKey: "allocationId", as: "commissionRecords" });

Wallet.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });
Agent.hasMany(Wallet, { foreignKey: 'agentId', as: 'walletTransfers' });

  
Agent.hasMany(AllocationRequest, { foreignKey: "agentId" });
AllocationRequest.belongsTo(Agent, { foreignKey: "agentId", as: "agent" });

module.exports = {
    sequelize,
    Allocation,
    EMIPayment,
    Agent,
    AgentCommission,
    AgentCommissionTracker,
    Target,
    CommissionLevel,
    Wallet,
    AllocationRequest
  };
  
