exports.isLogin = (req, res, next) => {
  const isLogin = req.session.isLogin;
  if (isLogin === undefined) {
    return res.redirect("/");
  }
  next();
};
