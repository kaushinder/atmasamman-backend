const CareerApplication = require("../models/CareerApplication");

const submitApplication = async (req, res, next) => {
  try {
    const { name, email, position, skills, coverLetter, resumeURL } = req.body;
    const application = await CareerApplication.create({ name, email, position, skills, coverLetter, resumeURL: resumeURL || "" });
    res.status(201).json({ success: true, message: "Application submitted! We will review and contact you.", data: { id: application._id, position: application.position } });
  } catch (error) { next(error); }
};

const getAllApplications = async (req, res, next) => {
  try {
    const applications = await CareerApplication.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) { next(error); }
};

module.exports = { submitApplication, getAllApplications };
