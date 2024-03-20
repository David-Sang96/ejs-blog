const { Router } = require("express");
const router = Router();
const userController = require("../controllers/auth.controller");

router.get("/register", userController.renderRegisterPage);

router.post("/register", userController.userRegister);

router.post("/logout", userController.userLogOut);

router.get("/login", userController.renderLoginPage);

router.post("/login", userController.userLogin);

router.get("/reset-password", userController.renderResetPasswordPage);

router.post("/reset-password", userController.sendResetPasswordLink);

router.get("/feedback", userController.renderFeedbackPage);

router.get("/change-new-password/:token", userController.renderNewPasswordPage);

router.post("/change-new-password", userController.changeNewPassword);

module.exports = router;
