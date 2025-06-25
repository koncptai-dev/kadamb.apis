const express = require("express");
const router = express.Router();
const adminapproveController=require("../controllers/adminapproveController")


router.put("/approve/:id", adminapproveController.approvePendingAllocation);

// Deny a pending allocation request (by Admin)
router.delete("/deny/:id", adminapproveController.denyPendingAllocation);

router.get("/requests/pending", adminapproveController.getAllPendingRequests);


module.exports = router;
