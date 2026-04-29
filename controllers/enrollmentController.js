const Enrollment = require("../models/Enrollment");

const submitEnrollment = async (req, res, next) => {
  try {
    const { name, email, phone, program, message } = req.body;
    const enrollment = await Enrollment.create({ name, email, phone, program, message });
    res.status(201).json({ success: true, message: "Enrollment submitted! We will contact you shortly.", data: { id: enrollment._id, program: enrollment.program } });
  } catch (error) { next(error); }
};

const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) { next(error); }
};

module.exports = { submitEnrollment, getAllEnrollments };
