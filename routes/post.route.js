const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

router.get("/", postController.getPosts);

router.get("/post/:id", postController.postDetails);

module.exports = router;
