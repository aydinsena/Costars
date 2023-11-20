const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();
const axios = require("axios");
const Wallet = require("../models/Wallet.model");
const User = require("../models/User.model");

router.get("/dashboard", isLoggedIn, (req, res, next) => {
  res.render("user/dashboard", { userInfo: req.session.currentUser });
});

router.get("/wallet", isLoggedIn, (req, res, next) => {
  axios.get("https://api.coinlore.net/api/tickers/").then((response) => {
    User.findById(req.session.currentUser._id)
      .populate("walletentity")
      .then((response1) => {
        console.log("canim", response1.walletentity);
        res.render("user/wallet", {
          userInfo: req.session.currentUser,
          data: response.data,
          walletInfo: response1.walletentity.walletvalues,
        });
      });
  });
});

router.post("/wallet", isLoggedIn, (req, res, next) => {
  const { name, amount } = req.body;
  const userId = req.session.currentUser._id;
  console.log(userId);
  User.findById(userId)
    .populate("walletentity")
    .then((user) => {
      user.walletentity.walletvalues.push({ name, amount });
      return user.walletentity.save();
    })

    .then((response) => {
      res.redirect("/user/wallet");
    })
    .catch((err) => console.log(err));
});
module.exports = router;
