const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
  certificateUrl: { type: String, required: true }
});

const Certificate = mongoose.model("Certificate", certificateSchema);
module.exports = Certificate;
