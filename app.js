const path = require("path");
const { connectDB } = require("./util/db");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const isAuthenticated = require("./middlewares/isAuth");
const multer = require("./util/multer");
const errorController = require("./controllers/error");
require("dotenv").config();
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const app = express();

const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "haunted97",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expiresIn: 40000,
    },
    store: store,
  })
);
app.use(flash());
app.use(isAuthenticated);

app.use("/admin", isAuthenticated, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// error handler
app.use(errorController.errorHandler);

app.listen(3000, () => {
  connectDB(process.env.DB_URI);
});
