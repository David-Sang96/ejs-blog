const bcrypt = require("bcrypt");

const User = require("../models/user");

exports.renderRegisterPage = (req, res) => {
  res.render("auth/register", {
    title: "Register Page",
  });
};

exports.userRegister = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const userDoc = await User.findOne({ email });
    if (userDoc) return res.redirect("/register");

    const hash = bcrypt.hashSync(password, 10);
    await User.create({
      userName,
      email,
      password: hash,
    });
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

exports.renderLoginPage = (req, res) => {
  res.render("auth/login", {
    title: "Login Page",
  });
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.redirect("/login");

    const isPassword = bcrypt.compareSync(password, userDoc.password);
    if (!isPassword) return res.redirect("/login");

    req.session.isLogin = true;
    req.session.userInfo = userDoc;
    req.session.save((err) => {
      res.redirect("/");
      console.log(err);
    });
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
