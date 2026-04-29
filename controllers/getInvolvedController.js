const GetInvolved = require("../models/GetInvolved");

const submitGetInvolved = async (req, res, next) => {
  try {
    const { name, email, interest, message } = req.body;
    const entry = await GetInvolved.create({ name, email, interest, message });
    res.status(201).json({ success: true, message: "Thank you for your interest! We will reach out soon.", data: { id: entry._id } });
  } catch (error) { next(error); }
};

const getAllGetInvolved = async (req, res, next) => {
  try {
    const entries = await GetInvolved.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) { next(error); }
};

module.exports = { submitGetInvolved, getAllGetInvolved };
