const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { submitContact, getAllContacts } = require("../controllers/contactController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.post("/",
  [body("name").trim().notEmpty().withMessage("Name is required"),
   body("email").isEmail().withMessage("Valid email required"),
   body("message").trim().notEmpty().withMessage("Message is required")],
  validate, submitContact
);
router.get("/", authMiddleware, getAllContacts);
module.exports = router;
