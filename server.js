const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const postRouter = require("./routes/post.route");
const adminRouter = require("./routes/admin.route");
const authRouter = require("./routes/auth.route");

const User = require("./models/user");

const { isLogin: isLoginMiddleware } = require("./middleware/isLogin");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtect = csrf();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
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

//send csrf token for every pages render
app.use((req, res, next) => {
  (res.locals.isLogin = req.session.isLogin ? true : false),
    (res.locals.csrfToken = req.csrfToken());
  (res.locals.currentUserEmail = req.session.userInfo?.userName), next();
});

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

app.use("/admin", isLoginMiddleware, adminRouter);
app.use(authRouter);
app.use(postRouter);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("connected to database");
    app.listen(4000, () => {
      console.log("server is listening at port 4000");
    });
  })
  .catch((err) => console.log(err));
