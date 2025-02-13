const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mentorId: { type: String, required: true, unique: true },
  internsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Intern" }]
});

const Mentor = mongoose.model("Mentor", mentorSchema);
module.exports = Mentor;
