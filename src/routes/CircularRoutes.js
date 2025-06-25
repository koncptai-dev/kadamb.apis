const express = require('express');
const router = express.Router();
const CircularRankController = require('../controllers/CircularRankController');

// Routes
router.post('/add', CircularRankController.createCircularRank);
router.get('/all', CircularRankController.getCircularRanks);
router.put('/update/:id', CircularRankController.updateCircularRank);
router.delete('/delete/:id', CircularRankController.DeleteCircularRank);

module.exports = router;
