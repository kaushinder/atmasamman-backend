const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { submitEnrollment, getAllEnrollments } = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const PROGRAMS = ["ATS - Tech Services","ASAI - AI School","AIMT - Management & Tech","Foundation Program"];

router.post("/",
  [body("name").trim().notEmpty().withMessage("Name is required"),
   body("email").isEmail().withMessage("Valid email required"),
   body("phone").trim().notEmpty().withMessage("Phone is required"),
   body("program").isIn(PROGRAMS).withMessage("Invalid program selected")],
  validate, submitEnrollment
);
router.get("/", authMiddleware, getAllEnrollments);
module.exports = router;
