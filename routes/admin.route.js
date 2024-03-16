const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

router.get("/create-post", postController.renderCreatePostPage);

router.post("/create", postController.createPost);

router.get("/edit-post/:id", postController.renderEditPage);

router.post("/update/:id", postController.editPost);

router.post("/delete/:id", postController.deletePost);

module.exports = router;
