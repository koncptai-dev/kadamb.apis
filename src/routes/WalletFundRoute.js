const express = require('express');
const router = express.Router();
const WalletFund= require('../controllers/WalletController');

router.post('/create', WalletFund.transferWallet);
router.get('/balance/:agentId', WalletFund.getBalance);
<<<<<<< HEAD
router.get('/getwalletFund/:agentId', WalletFund.getWalletFund);
=======
router.get('/getwalletFund', WalletFund.getWalletFund);
>>>>>>> 3dfa10798d5a344c2dfa09785c093ea62292b377
router.put('/edit/:id',WalletFund.editWalletFund)
router.get('/request/pending', WalletFund.getPendingWalletRequests);
router.put('/:id/status', WalletFund.updateWalletStatus);
router.delete('/delete/:id', WalletFund.deleteWalletRequest);
<<<<<<< HEAD
// router.get('/getWalletFund/pending', WalletFund.getPendingWalletRequests);
=======

>>>>>>> 3dfa10798d5a344c2dfa09785c093ea62292b377
module.exports = router;
