const bcrypt = require("bcrypt");
const User = require("../models/user");
const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

exports.renderRegisterPage = (req, res) => {
  const flash = req.flash("error");
  let message = flash.length > 0 ? flash[0] : null;
  res.render("auth/register", {
    title: "Register Page",
    errorMessage: message,
  });
};

exports.userRegister = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const userDoc = await User.findOne({ email });
    if (userDoc) {
      req.flash("error", "Email already exist.");
      return res.redirect("/register");
    }

    const hash = bcrypt.hashSync(password, 10);
    await User.create({
      userName,
      email,
      password: hash,
    });
    res.redirect("/login");
    transporter.sendMail(
      {
        from: process.env.SENDER_MAIL,
        to: email,
        subject: "Register Successful.",
        html: "<h1>Register account successful.</h1><p>Created an account by using this email address in Blog website.</p>",
      },
      (err) => {
        console.log(err);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.renderLoginPage = (req, res) => {
  const flash = req.flash("error");
  let message = flash.length > 0 ? flash[0] : null;
  res.render("auth/login", {
    title: "Login Page",
    errorMessage: message,
  });
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      req.flash("error", "Check your information and try again.");
      return res.redirect("/login");
    }

    const isPassword = bcrypt.compareSync(password, userDoc.password);
    if (!isPassword) return res.redirect("/login");

    req.session.isLogin = true;
    req.session.userInfo = userDoc;
    req.session.save((err) => {
      req.flash("success", "Logged In Successfully.");
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
