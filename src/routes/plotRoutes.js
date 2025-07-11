const express = require("express");
const router = express.Router();
const plotController = require("../controllers/plotController");

router.post("/add", plotController.addPlot);
router.put("/update/:id", plotController.updatePlot);
router.delete("/delete/:id", plotController.deletePlot);

router.get("/all", plotController.getAllPlots);
router.get("/available/:projectName", plotController.getAvailablePlotsByProject);
router.get("/sizes/:projectName", plotController.getAvailablePlotSizesByProject);
router.get("/find/:projectName/:plotNumber", plotController.getPlotByNumber);
router.get("/price/:projectName/:plotNumber", plotController.getPlotPrice);

module.exports = router;
