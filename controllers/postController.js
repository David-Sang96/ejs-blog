const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { format, formatISO9075 } = require("date-fns");
const pdf = require("pdf-creator-node");
const expressPath = require("path");

const fs = require("fs");
const deleteFile = require("../utils/deleteFile");

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
    const { title, description } = req.body;
    const image = req.file;
    if (image === undefined) {
      return res.status(422).render("addPost", {
        errorMessage: "Image extension must be jpg,png and jpeg",
        title: "Create",
        oldFormData: { title, description },
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("addPost", {
        errorMessage: errors.array()[0].msg,
        title: "Create",
        oldFormData: { title, description },
      });
    }
    await Post.create({
      title,
      description,
      image: image.path,
      userId: req.user,
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.getPostsAndRenderHomePage = async (req, res, next) => {
  try {
    const postsPerPage = 6;

    const totalPosts = await Post.find().countDocuments();
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    const currentPage = req.query.page || 1;
    if (currentPage > totalPages || currentPage < 1) {
      return res.status(500).render("error/500", {
        title: "Something wrong",
        errorMessage: "no post available",
      });
    }

    const posts = await Post.find()
      .select("title description image createdAt")
      .populate("userId", "userName email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * postsPerPage)
      .limit(postsPerPage);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title.substring(0, 40),
      image: post.image,
      description: post.description.substring(0, 150),
      date: format(new Date(post.createdAt), "dd-MMM-yyyy"),
      userId: post.userId.userName,
    }));
    res.render("home", {
      title: "Home",
      posts: formattedPosts,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
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
      oldFormData: { title: "", description: "", image: "" },
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
    const { title, description } = req.body;
    const image = req.file;
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
    if (image) {
      deleteFile(post.image);
      post.image = image.path;
    }
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
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.redirect("/");
    }
    deleteFile(postDoc.image);
    await Post.deleteOne({ _id: id, userId: req.user._id });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};

exports.savePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const templatePath = expressPath.join(
      __dirname,
      "../views/template/template.html"
    );
    const html = fs.readFileSync(templatePath, "utf8");
    const options = {
      format: "A3",
      orientation: "portrait",
      border: "10mm",
      header: {
        height: "20mm",
        contents:
          '<h4 style="text-align: center;">PDF DOWNLOAD FROM BLOG.IO</h4>',
      },
    };
    const postDoc = await Post.findById(id)
      .populate("userId", "email userName")
      .lean();
    const postDate = format(new Date(postDoc.createdAt), "dd-MMM-yyyy");
    const date = new Date();
    const pdfSavePath = `${expressPath.join(
      __dirname,
      "../public/pdf",
      date.getTime() + ".pdf"
    )}`;
    const document = {
      html,
      data: { postDoc, postDate },
      path: pdfSavePath,
      type: "",
    };
    await pdf.create(document, options);
    res.download(pdfSavePath, (err) => {
      if (err) throw err;
      deleteFile(pdfSavePath);
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong.Report to admin.");
    return next(err);
  }
};
