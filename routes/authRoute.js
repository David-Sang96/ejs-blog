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
      .notEmpty()
      .trim()
      .isLength({ min: 4 })
      .withMessage("Name must be at least 4 characters."),
    body("email")
      .notEmpty()
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
      .notEmpty()
      .trim()
      .isLength({ min: 5 })
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
    body("email").notEmpty().isEmail().withMessage("Invalid e-mail address"),
    body("password")
      .notEmpty()
      .trim()
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
    .notEmpty()
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
      .notEmpty()
      .trim()
      .isLength({ min: 5 })
      .isAlphanumeric()
      .withMessage(
        "Password must be at least 5 characters and contains only letters and numbers."
      ),
    body("confirm_password")
      .notEmpty()
      .trim()
      .withMessage("Please enter valid password.")
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
