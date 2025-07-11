const Plot = require("../models/Plot");
const { Sequelize,UniqueConstraintError } = require("sequelize");
const fs = require('fs');
const path = require('path');
const { log } = require("console");

// Add a new plot
exports.addPlot = async (req, res) => {
  try {
    const { projectName, plotSize, plotNumber, position, status, price, downPayment = 0, emiDuration = null } = req.body;
    // const image = req.file ? `uploads/uploadimagesmap/${req.file.filename}` : null;
    
          if (Number(price) && Number(downPayment) && Number(downPayment) > Number(price)) {
          return res.status(400).json({
            success: false,
            message: "Down payment cannot be greater than price"
          });
        }

    //  EMI calculation
    let emiAmount = null;

      if ( emiDuration != null &&  !isNaN(emiDuration) && emiDuration > 0 && price != null && downPayment != null && price > downPayment) {
        emiAmount = (price - downPayment) / emiDuration;
      }

      const parsePlotSize = (input) => {
              if (typeof input !== 'string') return { width: null, length: null, area: NaN };
        const match = input.match(/^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)/);
        if (!match) return { width: null, length: null, area: NaN };
        const width = parseFloat(match[1]);
        const length = parseFloat(match[2]);
        const area = width * length;
        return { width, length, area };
      };
      
      const { width, length, area } = parsePlotSize(plotSize);
      if (isNaN(area)) {
        return res.status(400).json({ success: false, message: "Invalid plot size format. Use 'Width x Length' or numeric value." });
      }
      
      const yard = area / 9;
     
      
    const newPlot = await Plot.create({
      projectName,
      plotSize:area,
      width,
      length,
      yard,
      plotNumber,
      position,
      status,
      price,
      downPayment,
      emiDuration,
      emiAmount,
      
    });

    res.status(201).json({ success: true, message: "Plot added successfully", plot: newPlot });
  }catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({
        success: false,
        message: "Plot number already exists for this project",
      });
    }
    console.error("Error adding plot:", error);
    return res.status(500).json({ success: false, message: "Error adding plot", error: error.message });
  }
};

// Get all plots
exports.getAllPlots = async (req, res) => {
  try {
    const plots = await Plot.findAll(
      
    );
    res.status(200).json({ plots });
  } catch (error) {
    console.error("Error fetching plots:", error);
    res.status(500).json({ success: false, message: "Error fetching plots", error: error.message });
  }
};


exports.updatePlot = async (req, res) => {
  try {
    const { id } = req.params;
    let { projectName, plotSize, plotNumber, position, status, price, downPayment = 0, emiDuration = null } = req.body;

    const plot = await Plot.findByPk(id);
    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not found" });
    }
        if (Number(price) && Number(downPayment) && Number(downPayment) > Number(price)) {
          return res.status(400).json({
            success: false,
            message: "Down payment cannot be greater than price"
          });
        }
    // Plot size parsing
    const parsePlotSize = (input) => {
      if (typeof input !== 'string') return { width: null, length: null, area: NaN };
      const match = input.match(/^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)/);
      if (!match) return { width: null, length: null, area: NaN };
      const width = parseFloat(match[1]);
      const length = parseFloat(match[2]);
      const area = width * length;
      return { width, length, area };
    };

    const {width,length,area} = parsePlotSize(plotSize);
    if (isNaN(area)) {
      return res.status(400).json({ success: false, message: "Invalid plot size format. Use 'Width x Length' or numeric value." });
    }

    const yard = area / 9;

    // EMI calculation
    let emiAmount = null;
      if ( emiDuration != null &&  !isNaN(emiDuration) && emiDuration > 0 && price != null && downPayment != null && price > downPayment) {
      emiAmount = (price - downPayment) / emiDuration;
    }
   

    // Perform update
    await plot.update({
      projectName,
      plotSize: area,
      width,
      length,
      yard,
      plotNumber,
      position,
      status,
      price,
      downPayment,
      emiDuration,
      emiAmount,
     
    });

    res.status(200).json({ success: true, message: "Plot updated successfully", plot });
  } catch (error) {
    console.error("Error updating plot:", error);
    res.status(500).json({ success: false, message: "Error updating plot", error: error.message });
  }
}

exports.deletePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const plot = await Plot.findByPk(id);
    if (!plot) return res.status(404).json({ message: 'plot not found' });

    await plot.destroy();
    res.status(200).json({ message: 'Plot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plot ', error: error.message });
  }
}


exports.getPlotByNumber = async (req, res) => {
  try {
    const { projectName, plotNumber } = req.params;
    const plot = await Plot.findOne({
      where: { projectName, plotNumber, status: "Available" },
    });

    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not available or does not exist" });
    }

    res.status(200).json({ success: true, plot });
  } catch (error) {
    console.error("Error fetching plot:", error);
    res.status(500).json({ success: false, message: "Error fetching plot", error: error.message });
  }
};


exports.getAvailablePlotSizesByProject = async (req, res) => {
  try {
    const { projectName } = req.params;

    const plots = await Plot.findAll({
      attributes: ["plotSize", "plotNumber"],
      where: { projectName, status: "Available" },
      order: [["plotSize", "ASC"], ["plotNumber", "ASC"]],
    });

    // Organize data by plotSize
    const sizesWithPlots = plots.reduce((acc, plot) => {
      if (!acc[plot.plotSize]) {
        acc[plot.plotSize] = [];
      }
      acc[plot.plotSize].push(plot.plotNumber);
      return acc;
    }, {});

    res.status(200).json({ success: true, sizes: sizesWithPlots });
  } catch (error) {
    console.error("Error fetching plot sizes:", error);
    res.status(500).json({ success: false, message: "Error fetching plot sizes", error: error.message });
  }
};

exports.getAvailablePlotsByProject = async (req, res) => {
  try {
    const { projectName } = req.params;
    const availablePlots = await Plot.findAll({
      where: { projectName, status: "Available" },
    });

    res.status(200).json({ success: true, plots: availablePlots });
  } catch (error) {
    console.error("Error fetching available plots:", error);
    res.status(500).json({ success: false, message: "Error fetching available plots", error: error.message });
  }
};

// Get plot price by projectName and plotNumber
exports.getPlotPrice = async (req, res) => {
  try {
    const { projectName, plotNumber } = req.params;

    const plot = await Plot.findOne({
      where: { projectName, plotNumber },
    });

    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not found" });
    }

    res.status(200).json({ success: true, price: plot.price });
  } catch (error) {
    console.error("Error fetching plot price:", error);
    res.status(500).json({ success: false, message: "Error fetching plot price", error: error.message });
  }
};


