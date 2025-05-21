const Plot = require("../models/Plot");
const { Sequelize } = require("sequelize");

// Add a new plot
// exports.addPlot = async (req, res) => {
//   try {
//     const { projectName, plotSize, plotNumber, status, price } = req.body;
//     const newPlot = await Plot.create({ projectName, plotSize, plotNumber, status, price });
//     res.status(201).json({ success: true, message: "Plot added successfully", plot: newPlot });
//   } catch (error) {
//     console.error("Error adding plot:", error);
//     res.status(500).json({ success: false, message: "Error adding plot", error: error.message });
//   }
// };

// Add a new plot
exports.addPlot = async (req, res) => {
  try {
    const { projectName, plotSize, plotNumber, position, status, price, downPayment = 0, emiDuration = null,latitude, longitude  } = req.body;

    //  EMI calculation
    let emiAmount = null;

      if (emiDuration && price && downPayment != null) {
        emiAmount = (price - downPayment) / emiDuration;
      }


    //yards calculation
      // if(!plotSize || isNaN(plotSize)){
      //   return res.status(400).json({ success: false, message: "plot size is required and must be number" });
      // }
      // const yard = plotSize / 9;

      const parsePlotSize = (input) => {
        if (typeof input === 'number') return input;
        if (typeof input !== 'string') return NaN;
      
        const match = input.match(/^(\d+(?:\.\d+)?)\s*[xX\*]\s*(\d+(?:\.\d+)?)/);
        if (!match) return NaN;
      
        const width = parseFloat(match[1]);
        const length = parseFloat(match[2]);
        return width * length;
      };
      
      const parsedPlotSize = parsePlotSize(plotSize);
      if (isNaN(parsedPlotSize)) {
        return res.status(400).json({ success: false, message: "Invalid plot size format. Use 'Width x Length' or numeric value." });
      }
      
      const yard = parsedPlotSize / 9;
      
    const newPlot = await Plot.create({
      projectName,
      plotSize:parsedPlotSize,
      yard,
      plotNumber,
      position,
      status,
      price,
      downPayment,
      emiDuration,
      emiAmount,
      latitude,   
      longitude, 
    });

    res.status(201).json({ success: true, message: "Plot added successfully", plot: newPlot });
  } catch (error) {
    console.error("Error adding plot:", error);
    res.status(500).json({ success: false, message: "Error adding plot", error: error.message });
  }
};

// Get all plots
exports.getAllPlots = async (req, res) => {
  try {
    const plots = await Plot.findAll();
    res.status(200).json({ plots });
  } catch (error) {
    console.error("Error fetching plots:", error);
    res.status(500).json({ success: false, message: "Error fetching plots", error: error.message });
  }
};

// Update a plot
// exports.updatePlot = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { projectName, plotSize, plotNumber, status, price } = req.body;

//     const plot = await Plot.findByPk(id);
//     if (!plot) {
//       return res.status(404).json({ success: false, message: "Plot not found" });
//     }

//     await plot.update({ projectName, plotSize, plotNumber, status, price });
//     res.status(200).json({ success: true, message: "Plot updated successfully", plot });
//   } catch (error) {
//     console.error("Error updating plot:", error);
//     res.status(500).json({ success: false, message: "Error updating plot", error: error.message });
//   }
// };


// Update a plot
exports.updatePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, plotSize, plotNumber, position, status, price, downPayment = 0, emiDuration = null,latitude, longitude } = req.body;

    const plot = await Plot.findByPk(id);
    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not found" });
    }
    //recalculate yard
    if(plotSize || !isNaN(plotSize)){
      yard= plotSize / 9;
    }

    //  EMI calculation
    let emiAmount = null;

      if (emiDuration && price && downPayment != null) {
        emiAmount = (price - downPayment) / emiDuration;
      }

    await plot.update({
      projectName,
      plotSize,
      yard,
      plotNumber,
      position,
      status,
      price,
      downPayment,
      emiDuration,
      emiAmount,
      latitude,    // ✅ add
      longitude, 
    });

    res.status(200).json({ success: true, message: "Plot updated successfully", plot });
  } catch (error) {
    console.error("Error updating plot:", error);
    res.status(500).json({ success: false, message: "Error updating plot", error: error.message });
  }
};



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
