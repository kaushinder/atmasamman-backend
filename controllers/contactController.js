const Contact = require("../models/Contact");

const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const contact = await Contact.create({ name, email, message });
    res.status(201).json({ success: true, message: "Your message has been received. We will get back to you soon!", data: { id: contact._id } });
  } catch (error) { next(error); }
};

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) { next(error); }
};

module.exports = { submitContact, getAllContacts };
