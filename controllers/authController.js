const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "atmasamman_jwt_secret_key_2024",
    { expiresIn: "7d" }
  );
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email and password are required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: "An account with this email already exists" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, message: "No account found with this email" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const resetLink = `${process.env.FRONTEND_URL}/resetPassword?token=${resetToken}&email=${user.email}`;

      await transporter.sendMail({
        from: `"Atmasamman Group" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request - Atmasamman Group",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#1e293b;">Password Reset Request</h2>
            <p style="color:#475569;">Hi ${user.name},</p>
            <p style="color:#475569;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetLink}" style="display:inline-block;margin:24px 0;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>
            <p style="color:#94a3b8;font-size:0.85rem;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
            <p style="color:#94a3b8;font-size:0.8rem;">Atmasamman Group &mdash; atmasamman-frontend.vercel.app</p>
          </div>
        `,
      });
    }

    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ success: false, message: "Token, email and password are required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };