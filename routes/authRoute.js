const { Router } = require("express");
const router = Router();
const userController = require("../controllers/authController");
const { body, check } = require("express-validator");
const User = require("../models/user");

router.get("/register", userController.renderRegisterPage);

router.post(
  "/register",
  [
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 4 })
      .withMessage("Name must be at least 4 characters.")
      .matches(/^[a-zA-Z0-9\s]+$/)
      .withMessage("Special characters are not allowed."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("E-mail is required")
      .isEmail()
      .withMessage("Not a valid e-mail address")
      .custom((value, { req }) => {
        //async validation
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            throw new Error("E-mail already in use");
          }
        });
      }),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters")
      .isAlphanumeric()
      .withMessage(
        "Password must be at least 5 characters and contains only letters and numbers."
      ),
  ],
  userController.userRegister
);

router.post("/logout", userController.userLogOut);

router.get("/login", userController.renderLoginPage);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("E-mail is required")
      .isEmail()
      .withMessage("Invalid e-mail address"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .withMessage("Password must be valid."),
  ],
  userController.userLogin
);

router.get("/reset-password", userController.renderResetPasswordPage);

router.post(
  "/reset-password",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Not a valid e-mail address")
    .custom((value, { req }) => {
      return User.findOne({ value }).then((user) => {
        if (!user) {
          throw new Error("E-mail doesn't exist.");
        }
      });
    }),
  userController.sendResetPasswordLink
);

router.get("/feedback", userController.renderFeedbackPage);

router.get("/change-new-password/:token", userController.renderNewPasswordPage);

router.post(
  "/change-new-password",
  [
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters.")
      .matches(/^[a-zA-Z0-9\s]+$/)
      .withMessage("Special characters are not allowed."),
    body("confirm_password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password doesn't match.");
        }
        return true;
      }),
  ],
  userController.changeNewPassword
);

module.exports = router;
