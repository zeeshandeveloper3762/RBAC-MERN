require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const User = require("./models/userModel");
const routes = require("./routes/route.js");

const app = express();

const PORT = process.env.PORT || 8000;

mongoose
  .connect(
    "mongodb+srv://zk3762100:UYt3mQXFgAqB6UGS@cluster0.itmtuqh.mongodb.net/rbac"
  )
  .then(() => {
    console.log("Connected to the Database successfully");
  });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: "JWT token has expired, please login to obtain a new one",
      });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

app.use("/", routes);
app.listen(PORT, () => {
  console.log("Server is listening on Port:", PORT);
});
