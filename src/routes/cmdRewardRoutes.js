const express = require("express");
const { getSubAgentRewards } = require("../controllers/cmdRewardController");
const authenticate = require("../middlewares/auth");
const router = express.Router();

router.get("/sub-agent-rewards", authenticate, getSubAgentRewards);

module.exports = router;
