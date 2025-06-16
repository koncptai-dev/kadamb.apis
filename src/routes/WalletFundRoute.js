const express = require('express');
const router = express.Router();
const WalletFund= require('../controllers/WalletController');

router.post('/create', WalletFund.transferWallet);
router.get('/balance/:agentId', WalletFund.getBalance);
router.get('/getwalletFund/:agentId', WalletFund.getWalletFund);
router.put('/edit/:id',WalletFund.editWalletFund)
router.get('/request/pending', WalletFund.getPendingWalletRequests);
router.put('/:id/status', WalletFund.updateWalletStatus);
router.delete('/delete/:id', WalletFund.deleteWalletRequest);
// router.get('/getWalletFund/pending', WalletFund.getPendingWalletRequests);
module.exports = router;
