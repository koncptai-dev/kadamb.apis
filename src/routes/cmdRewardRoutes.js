const express = require("express");
const cmdRewardController = require("../controllers/cmdRewardController");
const authenticate = require("../middlewares/auth");
const router = express.Router();

router.get("/sub-agent-rewards", authenticate,cmdRewardController.getSubAgentRewards);

module.exports = router;
