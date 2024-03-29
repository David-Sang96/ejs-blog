const Post = require("../models/post");
const User = require("../models/user");
const { format } = require("date-fns");
const { validationResult } = require("express-validator");

exports.renderProfilePage = async (req, res, next) => {
  try {
    const postPerPage = 6;
    const currentPage = req.query.page || 1;

    const totalPosts = await Post.find({
      userId: req.user._id,
    }).countDocuments();
    const totalPages = Math.ceil(totalPosts / postPerPage);

    if (currentPage > totalPages || currentPage < 1) {
      return res.status(500).render("error/500", {
        title: "Profile",
        errorMessage: "no post available",
      });
    }

    const posts = await Post.find({ userId: req.user._id })
      .populate("userId", "email userName")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * postPerPage)
      .limit(postPerPage);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title.substring(0, 40),
      image: post.image,
      description: post.description.substring(0, 150),
      date: format(new Date(post.createdAt), "dd-MMM-yyyy"),
      userName: post.userId.userName,
    }));
    res.render("user/profile", {
      title: req.session.userInfo.userName,
      email: req.session.userInfo.email,
      posts: formattedPosts,
      errorMessage: "",
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderPublicProfilePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postPerPage = 6;
    const currentPage = req.query.page || 1;

    const totalPosts = await Post.find({
      userId: id,
    }).countDocuments();
    const totalPages = Math.ceil(totalPosts / postPerPage);

    if (currentPage > totalPages || currentPage < 1) {
      return res.status(500).render("error/500", {
        title: "Profile",
        errorMessage: "no post available",
      });
    }

    const posts = await Post.find({ userId: id })
      .populate("userId", "email userName")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * postPerPage)
      .limit(postPerPage);
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title.substring(0, 40),
      image: post.image,
      description: post.description.substring(0, 150),
      date: format(new Date(post.createdAt), "dd-MMM-yyyy"),
      userName: post.userId.userName,
    }));

    res.render("user/publicProfile", {
      title: posts[0].userId.userName,
      userName: posts[0].userId.userName,
      posts: formattedPosts,
      userId: id,
      errorMessage: "",
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderResetUserNamePage = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user._id);
    if (!userDoc) {
      return res.status(500).render("error/500", {
        title: "something went wrong",
        errorMessage: "no user found with this ID",
      });
    }
    res.render("user/userName", {
      title: "userName page",
      errorMessage: "",
      oldFormData: { username: "" },
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.resetUserName = async (req, res, next) => {
  try {
    const { username } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/userName", {
        title: "userName page",
        errorMessage: errors.array()[0].msg,
        oldFormData: { username },
      });
    }
    const userDoc = await User.findById(req.user._id);
    if (!userDoc) {
      return res.status(500).render("error/500", {
        title: "something went wrong",
        errorMessage: "no user found with this ID",
      });
    }
    userDoc.userName = username;
    userDoc.save();
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderPremiumPage = (req, res, next) => {
  try {
    res.render("user/premium", { title: "Premium Page", errorMessage: "" });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};
