const express = require("express");
const router = express.Router();
const { getAgentInstallments } = require("../controllers/installmentController");
const auth = require("../middlewares/auth"); // Ensure only logged-in agents access

router.get("/installments", auth, getAgentInstallments);

module.exports = router;
