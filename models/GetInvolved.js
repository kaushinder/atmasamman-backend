const mongoose = require("mongoose");
const getInvolvedSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  interest: { type: String, enum: ["Volunteer","Donate","Mentor","Partner"], default: "Volunteer" },
  message: { type: String, trim: true, default: "" },
}, { timestamps: true });
module.exports = mongoose.model("GetInvolved", getInvolvedSchema);
