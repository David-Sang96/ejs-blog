const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const postRouter = require("./routes/post.route");
const adminRouter = require("./routes/admin.route");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(postRouter);
app.use("/admin", adminRouter);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("connected to database");
    app.listen(4000, () => {
      console.log("server is listening at port 4000");
    });
  })
  .catch((err) => console.log(err));
