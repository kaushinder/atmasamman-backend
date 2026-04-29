const mongoose = require("mongoose");
const careerApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  position: { type: String, required: true, trim: true },
  skills: { type: String, trim: true, default: "" },
  coverLetter: { type: String, trim: true, default: "" },
  resumeURL: { type: String, default: "" },
  status: { type: String, enum: ["pending","reviewing","shortlisted","rejected","hired"], default: "pending" },
}, { timestamps: true });
module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
