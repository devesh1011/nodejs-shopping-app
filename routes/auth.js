const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  getLogin,
  postLogin,
  logout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
} = require("../controllers/auth");
const isAuthenticated = require("../middlewares/isAuth");

router.get("/login", getLogin);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    check("password").trim().notEmpty().withMessage("Password is required"),
  ],
  postLogin
);
router.post("/logout", isAuthenticated, logout);
router.get("/signup", getSignUp);
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Please enter a valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .normalizeEmail()
      .trim(),
    check("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  postSignUp
);
router.get("/reset", getReset);
router.post("/reset", postReset);

module.exports = router;
