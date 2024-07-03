exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated: false,
  });
};

exports.errorHandler = (err, req, res, next) => {
  res.render("500", { pageTitle: "Some Error Occurred", path: "/500" });
};
