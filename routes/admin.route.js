const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { body } = require("express-validator");

router.get("/create-post", postController.renderCreatePostPage);

router.post(
  "/create",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .matches(/^[a-zA-Z0-9\s?!]+$/)
      .withMessage("Special characters are not allowed.")
      .isLength({ min: 10 })
      .withMessage("Title must be at least 10 characters"),
    body("image")
      .trim()
      .notEmpty()
      .withMessage("Image is required")
      .isURL()
      .withMessage("Must be a valid URL"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 30 })
      .withMessage("Description must be at least 30 characters"),
  ],
  postController.createPost
);

router.get("/edit-post/:id", postController.renderEditPage);

router.post(
  "/update/:id",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .matches(/^[a-zA-Z0-9\s?!]+$/)
      .withMessage("Special characters are not allowed..")
      .isLength({ min: 10 })
      .withMessage("Title must be at least 10 characters"),
    body("image")
      .trim()
      .notEmpty()
      .withMessage("Image is required")
      .isURL()
      .withMessage("Must be a valid URL"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 30 })
      .withMessage("Description must be at least 30 characters"),
  ],
  postController.editPost
);

router.post("/delete/:id", postController.deletePost);

module.exports = router;
