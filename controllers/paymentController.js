const Payment = require("../models/Payment");
const { v4: uuidv4 } = require("uuid");

// Initialize Razorpay only if key exists
let Razorpay = null;
let razorpayInstance = null;

try {
  Razorpay = require("razorpay");
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.log("Razorpay not available, using mock mode");
}

// Create a Razorpay order (returns order_id for frontend)
const createOrder = async (req, res, next) => {
  try {
    const { amount, program, name, email } = req.body;
    if (!amount || !program)
      return res.status(400).json({ success: false, message: "Amount and program are required" });

    const amountInPaise = Math.round(Number(amount) * 100);

    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: "rcpt_" + uuidv4().slice(0, 8),
        notes: { program, name, email },
      });
      return res.status(201).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    } else {
      // Mock order for dev/demo mode
      return res.status(201).json({
        success: true,
        data: {
          orderId: "order_" + uuidv4().replace(/-/g, "").slice(0, 14),
          amount: amountInPaise,
          currency: "INR",
          keyId: "rzp_test_demo",
          mock: true,
        },
      });
    }
  } catch (error) { next(error); }
};

// Verify payment & save to DB
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, program, amount, method } = req.body;

    let status = "success";

    if (razorpayInstance && razorpay_signature) {
      const crypto = require("crypto");
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
      if (expectedSignature !== razorpay_signature) {
        status = "failed";
        return res.status(400).json({ success: false, message: "Payment verification failed" });
      }
    }

    const transactionId = razorpay_payment_id || ("TXN-" + uuidv4().toUpperCase().replace(/-/g, "").slice(0, 12));

    const payment = await Payment.create({
      userId: req.user?.id || "",
      name, email, program,
      amount: Number(amount),
      method: method || "card",
      transactionId,
      status,
      paidAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Payment successful!",
      data: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        program: payment.program,
        status: payment.status,
      },
    });
  } catch (error) { next(error); }
};

// Demo/mock payment (no gateway needed)
const submitPayment = async (req, res, next) => {
  try {
    const { name, email, program, amount, method, userId } = req.body;
    const transactionId = "TXN-" + uuidv4().toUpperCase().replace(/-/g, "").slice(0, 12);
    const payment = await Payment.create({
      userId: userId || req.user?.id || "",
      name, email, program,
      amount: Number(amount),
      method,
      transactionId,
      status: "success",
      paidAt: new Date(),
    });
    res.status(201).json({
      success: true,
      message: "Payment recorded successfully!",
      data: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        program: payment.program,
        status: payment.status,
      },
    });
  } catch (error) { next(error); }
};

const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) { next(error); }
};

module.exports = { createOrder, verifyPayment, submitPayment, getAllPayments };
