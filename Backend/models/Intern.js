const mongoose = require("mongoose");

const InternSchema = new mongoose.Schema({
    name: String,
    age: Number,
    mobile: String,
    email: String,
    addressPermanent: String,
    addressCurrent: String,
    education: String,
    grades: String,
    familyDRDO: String,
    pastExperience: String,
    drdoLabs: String,
    aadhar: { type: String, unique: true },
    identificationMark: String,
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
    status: { type: String, default: "Pending" },
});

module.exports = mongoose.model("Intern", InternSchema);
