const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const app = express();
const agent =  require('./routes/agentRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 
// const Target = require('./models/Agent');
// const Plot = require('./models/CommissionLevel');
// const CommissionLevel = require('./models/Plot');
//  const allocation = require('./models/allocation');
//  const emiPayment = require('./models/emipayment');
//  const AgentCommission = require('./models/AgentCommission');
//  const AgentCommissionTracker = require('./models/AgentCommissionTracker');

const commissionRoutes = require("./routes/commissionRoutes");
const index = require('./models/index');

const commissionLevelRoutes = require('./routes/commissionLevelRoutes');
const plotRoutes = require("./routes/plotRoutes");
const targetRoutes = require("./routes/targetRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const emiPaymentRoutes = require("./routes/emiPaymentRoutes");
const dueInstallmentsRoutes = require("./routes/dueInstallmentsRoutes");
const businessRoutes = require("./routes/businessRoutes");
const installmentRoutes = require("./routes/installmentRoutes");
const cmdRewardRoutes = require("./routes/cmdRewardRoutes"); 
const walletfund = require('./routes/WalletFundRoute'); 
const officeAgent = require('./routes/officeAgentRoutes'); // Import Office Agent Routes
const adminapproveRoute = require('./routes/adminapproveRoute'); // Import Admin Approve Routes
const associateBusinessRoute = require('./routes/associateBussinessRoute'); 
const CircularRoutes = require('./routes/CircularRoutes'); 

app.use(cors());
app.use(bodyParser.json());
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/agent', agent);
app.use('/api/officeagent', officeAgent); // Use Office Agent Routes
app.use('/api', uploadRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/superadmin", superAdminRoutes); 
app.use('/api/commission-level', commissionLevelRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/allocation", allocationRoutes);
app.use("/api", emiPaymentRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api", dueInstallmentsRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/installment", installmentRoutes);
app.use("/api", cmdRewardRoutes);
app.use("/api/walletfund",walletfund);
app.use("/api/adminapprove", adminapproveRoute); // Use Admin Approve Routes
app.use("/api", associateBusinessRoute); 
app.use("/api/circular-rank", CircularRoutes); 


app.use(cors({
    origin: 'https://kadamprojects.com/', // Allow only your frontend's IP
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // if you're using cookies/sessions
}));


sequelize.sync({ alter: true }) // ✅ This ensures new models are created
  .then(() => console.log('✅ Database Synced'))
  .catch((err) => console.log('❌ Sync Error:', err));

module.exports = app;
