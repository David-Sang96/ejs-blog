const { Router } = require("express");
const router = Router();
const userController = require("../controllers/auth.controller");

router.get("/register", userController.renderRegisterPage);

router.post("/register", userController.userRegister);

router.post("/logout", userController.userLogOut);

router.get("/login", userController.renderLoginPage);

router.post("/login", userController.userLogin);

module.exports = router;
