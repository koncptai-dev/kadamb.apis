const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const authenticateToken = require("../middlewares/auth");
// Login Route
router.post("/login", superAdminController.loginSuperAdmin);

// Create Super Admin (One-time use)
router.post("/create", superAdminController.createSuperAdmin);

router.post("/change-password",authenticateToken, superAdminController.changePassword);


module.exports = router;
