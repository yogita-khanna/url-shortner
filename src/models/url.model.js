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
    default: Date.now
  }
});

module.exports = mongoose.model("URL", schema);
