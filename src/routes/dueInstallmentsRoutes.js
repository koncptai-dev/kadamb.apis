const express = require("express");
const { getDueInstallments } = require("../controllers/dueInstallmentsController");
const authenticate = require("../middlewares/auth");

const router = express.Router();

// Get due installments (Direct Sponsor / Team)
router.get("/due-installments", authenticate, getDueInstallments);

module.exports = router;
