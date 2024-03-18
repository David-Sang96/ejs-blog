const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

router.get("/", postController.getPostsAndRenderHomePage);

router.get("/post/:id", postController.postDetails);

module.exports = router;
