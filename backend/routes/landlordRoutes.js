const express = require("express");
const { check, body } = require("express-validator");
const Landlord = require("../model/landlordSchema");

const router = express.Router();

const landlordController = require("../controllers/landlordController");

router.get("/signup", landlordController.getSignup);

router.post(
  "/signup",
  [
    check("name", "Name is required.").notEmpty().escape(),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return Landlord.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and test and at least 5 characters."
    )
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
  ],
  landlordController.postSignup
);

router.get("/", landlordController.getLogin);

router.post(
  "/",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
  ],
  landlordController.postLogin
);

router.post("/logout", landlordController.postLogout);

module.exports = router;
