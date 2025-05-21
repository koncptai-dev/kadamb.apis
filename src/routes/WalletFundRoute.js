const express = require('express');
const router = express.Router();
const WalletFund= require('../controllers/WalletController');

router.post('/create', WalletFund.transferWallet);
router.get('/balance/:agentId', WalletFund.getBalance);
router.get('/getwalletFund', WalletFund.getWalletFund);
router.put('/edit/:id',WalletFund.editWalletFund)

module.exports = router;
