const User = require("../models/user");

exports.renderLogInPage = (req, res) => {
  res.render("auth/login", {
    title: "Login Page",
    isLogin: req.session.isLogin ? true : false,
  });
};

exports.userLogin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    req.session.isLogin = true;
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

exports.userLogOut = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};
