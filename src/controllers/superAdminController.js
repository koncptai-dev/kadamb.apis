const SuperAdmin = require("../models/SuperAdmin");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Super Admin Login
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find super admin by email
    const superAdmin = await SuperAdmin.findOne({ where: { email } });
    if (!superAdmin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: superAdmin.id, email: superAdmin.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create Super Admin (One-time setup)
exports.createSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Super Admin already exists" });
    }

    // Create super admin
    const newAdmin = await SuperAdmin.create({ email, password });

    res.status(201).json({ message: "Super Admin created successfully", newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const superAdminId = req.user.id; // Get Super Admin ID from JWT token (Middleware should extract it)

    // Find Super Admin by ID
    const superAdmin = await SuperAdmin.findByPk(superAdminId);
    if (!superAdmin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await superAdmin.update({ password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
