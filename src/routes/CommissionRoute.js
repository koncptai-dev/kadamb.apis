const express = require('express');
const router = express.Router();
const CommissionChart=require('../controllers/CommissionChart');

// Routes
router.post('/add', CommissionChart.CreateCommissionChart);
router.get('/all', CommissionChart.getAllCommissionCharts);
router.delete('/delete/:id', CommissionChart.deleteCommissionCharts);
router.put('/update/:id', CommissionChart.updateCommissionCharts);

module.exports = router;
