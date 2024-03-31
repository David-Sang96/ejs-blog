const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

const { isOwner } = require("../middleware/isOwner");

router.get("/", postController.getPostsAndRenderHomePage);

router.get("/post/:id", postController.postDetails);

router.get("/save/:id", isOwner, postController.savePost);

module.exports = router;
