const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.get("/", postController.getPostsAndRenderHomePage);

router.get("/post/:id", postController.postDetails);

router.get("/save/:id", postController.savePost);

module.exports = router;
