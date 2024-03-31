const { Router } = require("express");
const router = Router();
const { body } = require("express-validator");

const profileController = require("../controllers/profileController");
const { isLogin: isLoginMiddleware } = require("../middleware/isLogin");
const { premiumUser } = require("../middleware/isPremiumUser");

router.get("/profile", isLoginMiddleware, profileController.renderProfilePage);

router.get("/profile/:id", profileController.renderPublicProfilePage);

router.get(
  "/username",
  isLoginMiddleware,
  premiumUser,
  profileController.renderResetUserNamePage
);

router.post(
  "/reset-username",
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 4 })
    .withMessage("Name must be at least 4 characters.")
    .isLength({ max: 15 })
    .withMessage("Name must be only 15 characters."),
  isLoginMiddleware,
  premiumUser,
  profileController.resetUserName
);

router.get("/premium", isLoginMiddleware, profileController.renderPremiumPage);

router.get(
  "/subscription-success",
  isLoginMiddleware,
  profileController.renderSubscriptionSuccessPage
);

router.get(
  "/premium-details",
  isLoginMiddleware,
  profileController.premiumDetails
);

router.get(
  "/subscription-cancel",
  isLoginMiddleware,
  profileController.renderPremiumPage
);

router.get(
  "/profile-image",
  isLoginMiddleware,
  premiumUser,
  profileController.renderProfileImgUploadPage
);

router.post(
  "/profile-image",
  isLoginMiddleware,
  premiumUser,
  profileController.uploadProfileImage
);

module.exports = router;
