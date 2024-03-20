const Post = require("../models/post");

exports.renderCreatePostPage = (req, res) => {
  res.render("addPost", {
    title: "Create",
  });
};

exports.createPost = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    await Post.create({ title, description, image, userId: req.user });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

exports.getPostsAndRenderHomePage = async (req, res) => {
  try {
    const posts = await Post.find()
      .select("title description")
      .sort({ createdAt: -1 })
      .populate("userId", "userName email");
    res.render("home", {
      title: "Home",
      posts,
      currentUserEmail: req.session.userInfo?.email,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.postDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render("details", {
      title: "Details",
      post,
      currentLoginUserId: req.session.userInfo?._id,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.renderEditPage = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (post.userId.toString() !== req.session.userInfo._id.toString()) {
      return res.redirect("/");
    }
    res.render("editPost", {
      title: "Edit Page",
      post,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
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
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    // const post = await Post.findById(id);
    // if (post.userId.toString() !== req.user._id.toString()) {
    //   return res.redirect("/");
    // }
    await Post.deleteOne({ _id: id, userId: req.user._id });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};
