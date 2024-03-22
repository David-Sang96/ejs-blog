const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { format, formatISO9075 } = require("date-fns");

exports.renderCreatePostPage = (req, res, next) => {
  try {
    res.render("addPost", {
      errorMessage: "",
      title: "Create",
      oldFormData: { title: "", description: "", image: "" },
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, description, image } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("addPost", {
        errorMessage: errors.array()[0].msg,
        title: "Create",
        oldFormData: { title, description, image },
      });
    }
    await Post.create({ title, description, image, userId: req.user });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.getPostsAndRenderHomePage = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .select("title description createdAt")
      .sort({ createdAt: -1 })
      .populate("userId", "userName email");
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description.substring(0, 150),
      date: format(new Date(post.createdAt), "dd-MMM-yyyy"),
      userId: post.userId.userName,
    }));
    res.render("home", {
      title: "Home",
      posts: formattedPosts,
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.postDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("userId", "email");
    res.render("details", {
      title: "Details",
      post,
      time: format(new Date(post.createdAt), "hh:mm:ss a"),
      currentLoginUserId: req.session.userInfo?._id,
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.renderEditPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (post.userId.toString() !== req.session.userInfo._id.toString()) {
      return res.redirect("/");
    }
    res.render("editPost", {
      title: post.title,
      post,
      oldFormData: { title: "", image: "", description: "" },
      isValidationFail: false,
      errorMessage: "",
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.editPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("editPost", {
        title,
        errorMessage: errors.array()[0].msg,
        oldFormData: { title, image, description, id },
        isValidationFail: true,
      });
    }
    const post = await Post.findOne({ _id: id });
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    (post.title = title), (post.description = description);
    post.image = image;
    post.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Post.deleteOne({ _id: id, userId: req.user._id });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};
