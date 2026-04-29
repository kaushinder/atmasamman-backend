const mongoose = require("mongoose");
const enrollmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  program: {
    type: String, required: true,
    enum: ["ATS - Tech Services","ASAI - AI School","AIMT - Management & Tech","Foundation Program"],
  },
  message: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["pending","confirmed","rejected"], default: "pending" },
}, { timestamps: true });
module.exports = mongoose.model("Enrollment", enrollmentSchema);
