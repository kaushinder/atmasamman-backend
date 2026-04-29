require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes        = require("./routes/auth");
const contactRoutes     = require("./routes/contact");
const enrollmentRoutes  = require("./routes/enrollment");
const careerRoutes      = require("./routes/career");
const paymentRoutes     = require("./routes/payment");
const getInvolvedRoutes = require("./routes/getInvolved");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().catch((err) => console.error("DB init error:", err.message));

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://atmasamman-frontend.vercel.app", // fallback
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("CORS blocked"));
  },
  credentials: true,
}));

app.options("*", cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked"));
  },
  credentials: true,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many submissions, please try again later." },
});

app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (_req, res) =>
  res.json({
    success: true,
    message: "Atmasamman Group API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  })
);
app.get("/health", (_req, res) =>
  res.json({ status: "OK", uptime: process.uptime() })
);

app.use("/api/auth",        authRoutes);
app.use("/api/contact",     formLimiter, contactRoutes);
app.use("/api/enroll",      formLimiter, enrollmentRoutes);
app.use("/api/career",      formLimiter, careerRoutes);
app.use("/api/payment",     formLimiter, paymentRoutes);
app.use("/api/getInvolved", formLimiter, getInvolvedRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

app.use(errorHandler);

if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

module.exports = app;
