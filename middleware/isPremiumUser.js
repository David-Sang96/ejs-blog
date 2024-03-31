const User = require("../models/user");

exports.premiumUser = async (req, res, next) => {
  const userDoc = await User.findById(req.user._id);
  if (!userDoc || !userDoc.isPremium) {
    return res.redirect("/premium");
  }
  next();
};
