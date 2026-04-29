const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  userId: { type: String, default: "" },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  program: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  method: { type: String, enum: ["card","upi"], required: true },
  transactionId: { type: String, unique: true, required: true },
  status: { type: String, enum: ["pending","success","failed"], default: "pending" },
  paidAt: { type: Date },
}, { timestamps: true });
module.exports = mongoose.model("Payment", paymentSchema);
