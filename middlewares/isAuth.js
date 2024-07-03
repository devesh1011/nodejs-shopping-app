const User = require("../models/user");

const isAuthenticated = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.locals.isAuthenticated = false; // Set isAuthenticated to false if not logged in
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      res.locals.isAuthenticated = false; // Set isAuthenticated to false if user not found
      return next();
    }
    req.user = user;
    res.locals.isAuthenticated = true; // Set isAuthenticated to true if user is authenticated
    next();
  } catch (err) {
    console.error(err);
    res.locals.isAuthenticated = false; // Set isAuthenticated to false if an error occurs
    next();
  }
};

module.exports = isAuthenticated;
