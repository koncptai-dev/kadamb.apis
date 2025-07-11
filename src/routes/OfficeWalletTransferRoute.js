const express = require('express');
const router = express.Router();
const TransferWalletOffice=require('../controllers/officeWalletTransfer');
const authenticateToken =  require('../middlewares/auth');

router.get('/transfer',authenticateToken, TransferWalletOffice.getAgentsByOffice);
router.get('/balance/:agentId',authenticateToken, TransferWalletOffice.getBalanceByOffice);
router.post('/create', TransferWalletOffice.transferWalletByOffice);

module.exports = router;
