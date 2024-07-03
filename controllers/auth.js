const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const mailjet = require("../util/mailjet.js");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const renderAuth = async (req, res, view, options, message) => {
  res.render(`auth/${view}`, {
    pageTitle: options.pageTitle,
    path: options.path,
    errorMsg: message,
  });
};

const getLogin = async (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMsg: message,
  });
};

const getSignUp = async (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMsg: message,
  });
};

const getReset = async (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  renderAuth(
    req,
    res,
    "reset",
    {
      pageTitle: "Reset Password",
      path: "/reset",
    },
    message
  );
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMsg: errors.array()[0].msg,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) =>
      err ? res.redirect("/login") : res.redirect("/")
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const postSignUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMsg: errors.array()[0].msg,
    });
  }

  if (await User.findOne({ email })) {
    console.log("User already exists. Try with another email address");
    return res.redirect("/signup");
  }

  if (password !== confirmPassword) {
    console.log("Password should be equal to confirm password field");
    return res.redirect("/signup");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await new User({
    name,
    email,
    password: hashedPassword,
    cart: { items: [] },
  }).save();
  res.redirect("/login");
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

const postReset = async (req, res) => {
  const { email } = req.body;

  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No account with that email found.");
      return res.redirect("/reset");
    }

    user.resetToken = token;
    user.resetTokeExpriration = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:3000/reset/${token}`;

    try {
      const request = await mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "devesh.22scse1100004@galgotiasuniversity.edu.in", // Replace with your sender email
              Name: "Devesh",
            },
            To: [
              {
                Email: user.email,
                Name: user.name,
              },
            ],
            Subject: "Password Reset",
            HTMLPart: `
              <p>You requested a password reset</p>
              <p>Click this <a href="${resetLink}">link</a> to set a new password.</p>
            `,
          },
        ],
      });

      res.redirect("/");
    } catch (err) {
      console.log(err);
      req.flash("error", "There was an error sending the reset email.");
      res.redirect("/reset");
    }
  });
};

module.exports = {
  getLogin,
  postLogin,
  logout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
};
