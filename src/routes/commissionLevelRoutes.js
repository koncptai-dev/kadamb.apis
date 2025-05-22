const express = require('express');
const router = express.Router();
const commissionLevelController = require('../controllers/commissionLevelController');

// Routes
router.post('/add', commissionLevelController.addCommissionLevel);
router.get('/all', commissionLevelController.getAllCommissionLevels);
router.get('/:id', commissionLevelController.getCommissionLevelById);
router.put('/update/:id', commissionLevelController.updateCommissionLevel);
router.delete('/delete/:id', commissionLevelController.deleteCommissionLevel);

module.exports = router;
