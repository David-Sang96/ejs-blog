exports.render404Page = (req, res, next) => {
  res.status(404).render("error/404", { title: "Not Found" });
};

exports.render500page = (err, req, res, next) => {
  console.log(err.message);
  res.status(404).render("error/500", {
    title: "Something went wrong",
    errorMessage: err.message,
  });
};
