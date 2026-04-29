const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { submitGetInvolved, getAllGetInvolved } = require("../controllers/getInvolvedController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.post("/",
  [body("name").trim().notEmpty().withMessage("Name is required"),
   body("email").isEmail().withMessage("Valid email required"),
   body("interest").isIn(["Volunteer","Donate","Mentor","Partner"]).withMessage("Invalid interest")],
  validate, submitGetInvolved
);
router.get("/", authMiddleware, getAllGetInvolved);
module.exports = router;
