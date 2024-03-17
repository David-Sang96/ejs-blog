const User = require("../models/user");

exports.renderLogInPage = (req, res) => {
  res.render("auth/login", { title: "Login Page" });
};

exports.userLogin = async (req, res) => {
  try {
    res.setHeader("Set-Cookie", "isLogIn=true, HttpOnly");
    const { userName, email, password } = req.body;
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};
