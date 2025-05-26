const express = require("express");
const router = express.Router();
const plotController = require("../controllers/plotController");
const upload = require("../middlewares/uploadmiddleware");

router.post("/add", upload.single('file'),plotController.addPlot);
router.get("/all", plotController.getAllPlots);
router.put("/update/:id",upload.single('file'), plotController.updatePlot);

router.get("/available/:projectName", plotController.getAvailablePlotsByProject);
router.get("/sizes/:projectName", plotController.getAvailablePlotSizesByProject);
router.get("/find/:projectName/:plotNumber", plotController.getPlotByNumber);
router.get("/price/:projectName/:plotNumber", plotController.getPlotPrice);


module.exports = router;