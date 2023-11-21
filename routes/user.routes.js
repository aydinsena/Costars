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
      .then((resp) => {
        res.render("user/wallet", {
          userInfo: req.session.currentUser,
          data: response.data,
          walletInfo: resp.walletentity.walletvalues,
          walletTotal: resp.walletentity.total,
        });
      });
  });
});
//! refactor this code
//! change the format of the number values
router.post("/wallet", isLoggedIn, (req, res, next) => {
  const { name, amount } = req.body;
  let totalValue = 0;
  axios
    .get("https://api.coinlore.net/api/tickers/")
    .then((response) => {
      const coinFound = response.data.data.find((coin) => coin.name === name);
      // console.log(coinFound.price_usd);
      const userId = req.session.currentUser._id;
      // console.log(userId);
      const sumValue = (amount * coinFound.price_usd).toFixed(3);
      User.findById(userId)
        .populate("walletentity")
        .then((user) => {
          user.walletentity.walletvalues.push({
            name,
            amount,
            currentPrice: coinFound.price_usd,
            sum: sumValue,
          });
          return user.walletentity.save();
        })
        .then((wallet) => {
          wallet.walletvalues.forEach((e) => {
            totalValue += parseFloat(e.sum);
          });
          console.log(totalValue);
          wallet.total = totalValue.toFixed(3);
          return wallet.save();
        });
    })

    .then((response) => {
      res.redirect("/user/wallet");
    })
    .catch((err) => console.log(err));
});

router.get("/coins", isLoggedIn, (req, res, next) => {
  axios.get("https://api.coinlore.net/api/tickers/").then((response) => {
    //res.send(response.data.data);
    res.render("user/coins", { coinData: response.data.data });
  });
});

router.post("/coins", isLoggedIn, async (req, res, next) => {
  try {
    const { favCoin } = req.body;
    console.log("seethefavedcoins", favCoin);
    res.redirect("/user/coins");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
