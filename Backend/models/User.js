const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  role: { type: String, required: true }, // Role: "HR" or "Mentor"
  mentorId: { type: String, unique: true, sparse: true }, // Only for mentors
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre("save", async function (next) {
  if (this.role === "Mentor" && !this.mentorId) {
    this.mentorId = uuidv4(); // Generate a unique mentor ID
  }

  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
