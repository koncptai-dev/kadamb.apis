const express = require("express");
const router = express.Router();
const emiPaymentController = require("../controllers/emiPaymentController");

// Route to make a new EMI Payment
router.post("/emipayment", emiPaymentController.makeEMIPayment);

// Route to update an EMI Payment
router.put("/emipayment/:id", emiPaymentController.updateEMIPayment);




module.exports = router;
