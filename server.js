const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
require("dotenv").config();

const app = express();

const User = require("./models/user");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

const postRouter = require("./routes/post.route");
const adminRouter = require("./routes/admin.route");
const authRouter = require("./routes/auth.route");

app.set("view engine", "ejs");
app.set("views", "views");

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

app.use(async (req, res, next) => {
  const user = await User.findById("65f6605f484fc323607f933d");
  req.user = user;
  next();
});

app.use("/admin", adminRouter);
app.use(authRouter);
app.use(postRouter);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("connected to database");
    app.listen(4000, () => {
      console.log("server is listening at port 4000");
    });
    return User.findOne().then((user) => {
      if (!user) {
        User.create({
          userName: "David",
          email: "david@gmail.com",
          password: "davidsang",
        });
      }
      return user;
    });
  })
  .then((result) => console.log(result))
  .catch((err) => console.log(err));
