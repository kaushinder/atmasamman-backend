const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.post("/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate, register
);

router.post("/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate, login
);

router.get("/me", authMiddleware, getMe);

router.post("/forgot-password",
  [body("email").isEmail().withMessage("Valid email required")],
  validate, forgotPassword
);

router.post("/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate, resetPassword
);

module.exports = router;