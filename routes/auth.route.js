const { Router } = require("express");
const router = Router();
const userController = require("../controllers/auth.controller");

router.get("/login", userController.renderLogInPage);

router.post("/login", userController.userLogin);

router.post("/logout", userController.userLogOut);

module.exports = router;
