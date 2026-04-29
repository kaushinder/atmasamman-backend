const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { submitApplication, getAllApplications } = require("../controllers/careerController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.post("/",
  [body("name").trim().notEmpty().withMessage("Name is required"),
   body("email").isEmail().withMessage("Valid email required"),
   body("position").trim().notEmpty().withMessage("Position is required")],
  validate, submitApplication
);
router.get("/", authMiddleware, getAllApplications);
module.exports = router;
