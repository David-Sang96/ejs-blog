const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const postRouter = require("./routes/postRoute");
const adminRouter = require("./routes/adminRoute");
const authRouter = require("./routes/authRoute");
const errorController = require("./controllers/errorController");
const profileRouter = require("./routes/profileRoute");

const User = require("./models/user");

const { isLogin: isLoginMiddleware } = require("./middleware/isLogin");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtect = csrf();

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "gallery");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilterConfig = (req, file, cb) => {
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

app.use(express.static(path.join(__dirname, "public")));
app.use("/gallery", express.static(path.join(__dirname, "gallery")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: storageConfig, fileFilter: fileFilterConfig }).single(
    "image"
  )
);
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtect);
app.use(flash());

app.use(async (req, res, next) => {
  const isLogin = req.session.isLogin;
  const userId = req.session.userInfo?._id;
  if (isLogin === undefined) {
    return next();
  }
  const user = await User.findById(userId).select("userName email");
  req.user = user;
  next();
});

//send csrf token for every pages render
app.use((req, res, next) => {
  res.locals.isLogin = req.session.isLogin ? true : false;
  res.locals.csrfToken = req.csrfToken();
  res.locals.userId = req.session.userInfo?._id;
  next();
});

app.use("/admin", isLoginMiddleware, adminRouter);
app.use(authRouter);
app.use(postRouter);
app.use(profileRouter);

app.all("*", errorController.render404Page);
app.use(errorController.render500page);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("connected to database");
    app.listen(4000, () => {
      console.log("server is listening at port 4000");
    });
  })
  .catch((err) => console.log(err));
