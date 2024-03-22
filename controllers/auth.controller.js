const bcrypt = require("bcrypt");
const User = require("../models/user");
const nodeMailer = require("nodemailer");
require("dotenv").config();

const crypto = require("crypto");
const { validationResult } = require("express-validator");

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
    oldFormData: { email: "", userName: "", password: "" },
  });
};

exports.userRegister = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/register", {
        title: "Register Page",
        errorMessage: errors.array()[0].msg,
        oldFormData: { email, userName, password },
      });
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    await User.create({
      userName,
      email,
      password: hashPassword,
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
    oldFormData: { email: "", password: "" },
  });
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        title: "Login Page",
        errorMessage: errors.array()[0].msg,
        oldFormData: { email, password },
      });
    }

    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(422).render("auth/login", {
        title: "Login Page",
        errorMessage: "Please enter valid email and password",
        oldFormData: { email, password },
      });
    }
    const isPassword = bcrypt.compareSync(password, userDoc.password);
    if (!isPassword) {
      return res.status(422).render("auth/login", {
        title: "Login Page",
        errorMessage: "Please enter valid email and password",
        oldFormData: { email, password },
      });
    }

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

exports.renderResetPasswordPage = (req, res) => {
  const flash = req.flash("error");
  const message = flash.length > 0 ? flash[0] : null;
  res.render("auth/resetPassForm", {
    title: "Reset Password Page",
    errorMessage: message,
    oldFormData: { email: "" },
  });
};

exports.sendResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;
    let token;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect("/reset-password");
      }
      token = buffer.toString("hex");
    });
    const userDoc = await User.findOne({ email });
    const errors = validationResult(req);
    if (!userDoc) {
      return res.status(422).render("auth/resetPassForm", {
        title: "Reset Password Page",
        errorMessage: errors.array()[0].msg,
        oldFormData: { email },
      });
    }
    userDoc.resetToken = token;
    userDoc.tokenExpiration = Date.now() + 1800000;
    userDoc.save();
    res.redirect("/feedback");
    transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Reset Password",
      html: `<h1>Reset password.</h1><p>Change your account password by clicking the link below.</p> <a href="http://localhost:4000/change-new-password/${token}" target="_blank">change password</a>`,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.renderFeedbackPage = (req, res) => {
  res.render("auth/feedback", { title: "Feedback Page" });
};

exports.renderNewPasswordPage = async (req, res) => {
  try {
    const { token } = req.params;
    const userDoc = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!userDoc) return res.redirect("/");

    const flash = req.flash("error");
    const message = flash.length > 0 ? flash[0] : null;
    res.render("auth/newPassForm", {
      title: "Change Password Page",
      errorMessage: message,
      resetToken: token,
      user_id: userDoc._id,
      oldFormData: { password: "", confirm_password: "" },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.changeNewPassword = async (req, res) => {
  try {
    const { password, confirm_password, resetToken, userId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/newPassForm", {
        title: "Change Password Page",
        errorMessage: errors.array()[0].msg,
        resetToken,
        user_id: userId,
        oldFormData: { password, confirm_password },
      });
    }
    const userDoc = await User.findOne({
      resetToken,
      _id: userId,
      tokenExpiration: { $gt: Date.now() },
    });

    const hashPassword = bcrypt.hashSync(password, 10);
    userDoc.password = hashPassword;
    userDoc.resetToken = undefined;
    userDoc.tokenExpiration = undefined;
    userDoc.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};
