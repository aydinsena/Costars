const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();
const axios = require("axios");
const Wallet = require("../models/Wallet.model");

router.get("/dashboard", isLoggedIn, (req, res, next) => {
  res.render("user/dashboard", { userInfo: req.session.currentUser });
});

router.get("/wallet", isLoggedIn, (req, res, next) => {
  axios.get("https://api.coinlore.net/api/tickers/").then((response) => {
    res.render("user/wallet", {
      userInfo: req.session.currentUser,
      data: response.data,
    });
  });
});

router.post("/wallet", isLoggedIn, (req, res, next) => {
  const { name, amount } = req.body;
  Wallet.create({
    walletvalues: { name: name, amount: amount, sum: amount * 3 },
  })
    .then((response) => {
      res.redirect("/user/wallet");
    })
    .catch((err) => console.log(err));
});
module.exports = router;
