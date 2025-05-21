const express = require("express");
const router = express.Router();
const targetController = require("../controllers/targetController");
const authenticateToken = require("../middlewares/auth"); // Ensure authentication


router.post("/", authenticateToken, targetController.createTarget);
router.get("/", authenticateToken, targetController.getAllTargets);
router.get("/target-report", authenticateToken, targetController.getTargetReport);

module.exports = router;
