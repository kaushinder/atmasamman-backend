const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("MongoDB Connected: " + conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Don't call process.exit(1) in serverless — let the request fail gracefully
    throw error;
  }
};

mongoose.connection.on("disconnected", () => { isConnected = false; });
mongoose.connection.on("reconnected", () => { isConnected = true; });

module.exports = connectDB;
