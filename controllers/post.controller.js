const Post = require("../models/post");

const posts = [];

exports.renderCreatePostPage = (req, res) => {
  res.render("addPost", { title: "Create" });
};

exports.createPost = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    await Post.create({ title, description, image });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render("home", { title: "Home", posts });
  } catch (error) {
    console.log(error);
  }
};

exports.postDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render("details", { title: "Details", post });
  } catch (error) {
    console.log(error);
  }
};

exports.renderEditPage = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render("editPost", { title: "Edit Page", post });
  } catch (error) {
    console.log(error);
  }
};

exports.editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const post = await Post.findOne({ _id: id });
    (post.title = title), (post.description = description);
    post.image = image;
    post.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.deleteOne({ _id: id });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};
