const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    index: true // Indexing for faster queries on dashboards
  },
  metadata: {
    userAgent: String,
    ip: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Analytics", analyticsSchema);
