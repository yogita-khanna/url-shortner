const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  shortCode: {
    type: String,
    unique: true,
    required: true
  },
  longUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 * 24 * 365 // 365 Days
  }
});

module.exports = mongoose.model("URL", schema);
