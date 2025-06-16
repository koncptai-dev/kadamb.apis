const express = require("express");
const router = express.Router();
const allocationController = require("../controllers/allocationController");

// Routes
router.post("/allocate", allocationController.allocatePlot); // Allocate a plot
router.get("/all", allocationController.getAllAllocations); // Get all allocations
router.get("/:id", allocationController.getAllocationById); // Get single allocation
router.put("/update/:id", allocationController.updateAllocation); // Update allocation
router.delete("/delete/:id", allocationController.deleteAllocation); // Delete allocation

module.exports = router;
