const Post = require("../models/post");

exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("userId", "isPremium");
  if (
    postDoc.userId._id.toString() !== req.user?._id.toString() ||
    !postDoc.userId.isPremium
  ) {
    return res.redirect("/");
  }
  next();
};
