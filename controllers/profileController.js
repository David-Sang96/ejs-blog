const Post = require("../models/post");
const User = require("../models/user");
const { format, fromUnixTime } = require("date-fns");
const { validationResult } = require("express-validator");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.renderProfilePage = async (req, res, next) => {
  try {
    const postPerPage = 6;
    const currentPage = req.query.page || 1;

    const totalPosts = await Post.find({
      userId: req.user._id,
    }).countDocuments();

    if (!totalPosts) {
      return res.status(422).render("error/noPost", {
        title: req.session.userInfo.userName,
      });
    }
    const totalPages = Math.ceil(totalPosts / postPerPage);

    if (currentPage > totalPages || currentPage < 1) {
      return res.status(500).render("error/500", {
        title: "Something wrong",
        errorMessage: "no post available",
      });
    }

    const posts = await Post.find({ userId: req.user._id })
      .populate("userId", "email userName isPremium profile_imgUrl")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * postPerPage)
      .limit(postPerPage);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title.substring(0, 40),
      image: post.image,
      description: post.description.substring(0, 150),
      date: format(new Date(post.createdAt), "dd-MMM-yyyy"),
      userName: post.userId.userName,
      premiumUser: post.userId.isPremium,
      profileImg: post.userId.profile_imgUrl,
    }));
    res.render("user/profile", {
      title: req.session.userInfo.userName,
      email: req.session.userInfo.email,
      posts: formattedPosts,
      errorMessage: "",
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderPublicProfilePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postPerPage = 6;
    const currentPage = req.query.page || 1;

    const totalPosts = await Post.find({
      userId: id,
    }).countDocuments();
    const totalPages = Math.ceil(totalPosts / postPerPage);

    if (currentPage > totalPages || currentPage < 1) {
      return res.status(500).render("error/500", {
        title: "Profile",
        errorMessage: "no post available",
      });
    }

    const posts = await Post.find({ userId: id })
      .populate("userId", "email userName isPremium profile_imgUrl")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * postPerPage)
      .limit(postPerPage);
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title.substring(0, 40),
      image: post.image,
      description: post.description.substring(0, 150),
      date: format(new Date(post.createdAt), "dd-MMM-yyyy"),
      userName: post.userId.userName,
      premiumUser: post.userId.isPremium,
      profileImg: post.userId.profile_imgUrl,
    }));

    res.render("user/publicProfile", {
      title: posts[0].userId.userName,
      userName: posts[0].userId.userName,
      posts: formattedPosts,
      userId: id,
      errorMessage: "",
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderResetUserNamePage = (req, res, next) => {
  try {
    res.render("user/userName", {
      title: "userName page",
      errorMessage: "",
      oldFormData: { username: "" },
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.resetUserName = async (req, res, next) => {
  try {
    const { username } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("user/userName", {
        title: "userName page",
        errorMessage: errors.array()[0].msg,
        oldFormData: { username },
      });
    }
    const userDoc = await User.findById(req.user._id);
    if (!userDoc) {
      return res.status(500).render("error/500", {
        title: "something went wrong",
        errorMessage: "no user found with this ID",
      });
    }
    userDoc.userName = username;
    userDoc.save();
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderPremiumPage = async (req, res, next) => {
  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1OzZa4LnkPKv2t555vrNA6os",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.protocol}://${req.get(
        "host"
      )}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/subscription-cancel`,
    });
    res.render("user/premium", {
      title: " Premium Page",
      errorMessage: "",
      session_id: stripeSession.id,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderSubscriptionSuccessPage = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id || !session_id.includes("cs_test_"))
      return res.redirect("/profile");
    const userDoc = await User.findById(req.session.userInfo._id);
    userDoc.payment_session_key = session_id;
    userDoc.isPremium = true;
    userDoc.save();
    res.status(201).render("user/subscriptionSuccess", {
      title: "Subscription Success Page",
      subscription_id: session_id,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.premiumDetails = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user._id);
    const stripeSession = await stripe.checkout.sessions.retrieve(
      userDoc.payment_session_key
    );

    const date = fromUnixTime(stripeSession.created);
    const formattedDate = format(date, " dd-MMM-yyyy ");
    const formattedTime = format(date, "hh:mm:ss a ");
    res.render("user/premiumDetails", {
      title: "Premium Status",
      customer_id: stripeSession.customer,
      country: stripeSession.customer_details.address.country,
      postalCode: stripeSession.customer_details.address.postal_code,
      email: stripeSession.customer_details.email,
      name: stripeSession.customer_details.name,
      subscription: stripeSession.subscription,
      invoice_id: stripeSession.invoice,
      payment_status: stripeSession.payment_status,
      status: stripeSession.status,
      date: formattedDate,
      time: formattedTime,
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.renderProfileImgUploadPage = (req, res, next) => {
  try {
    res.render("user/profileUpload", {
      title: "Upload Profile Image",
      errorMessage: "",
    });
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};

exports.uploadProfileImage = async (req, res, next) => {
  try {
    const image = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("user/profileUpload", {
        title: "Upload Profile Image",
        errorMessage: errors.array()[0].msg,
      });
    }
    if (image === undefined) {
      return res.status(422).render("user/profileUpload", {
        title: "Upload Profile Image",
        errorMessage: "Image extension must be jpg,png and jpeg",
      });
    }
    const userDoc = await User.findById(req.user._id);
    if (!userDoc) {
      return res.status(500).render("error/500", {
        title: "something went wrong",
        errorMessage: "no user found with this ID",
      });
    }
    userDoc.profile_imgUrl = image.path;
    userDoc.save();
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    const err = new Error("Something wrong,report to admin.");
    next(err);
  }
};
