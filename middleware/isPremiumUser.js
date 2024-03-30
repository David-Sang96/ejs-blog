exports.premiumUser = (req, res, next) => {
  if (!req.session.userInfo?.isPremium) {
    return res.redirect("/");
  }
  next();
};
