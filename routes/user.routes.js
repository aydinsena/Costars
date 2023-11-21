const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();
const axios = require("axios");
const Wallet = require("../models/Wallet.model");
const User = require("../models/User.model");

router.get("/dashboard", isLoggedIn, async (req, res, next) => {
  try {
    const response = await axios.get("https://api.coinlore.net/api/tickers");
    const userId = req.session.currentUser._id;
    const getUserFavs = await User.findById(userId);

    // console.log(response.data.data);
    // console.log(getUserFavs._id);

    const favCoinNames = getUserFavs.favCoins;
    // console.log(getUserFavs.favCoins);
    if (favCoinNames.length === 0) {
      return res.render("user/dashboard", {
        message: "You have no coin faved",
        userInfo: req.session.currentUser,
      });
    }
    const fetchUserCoins = response.data.data.filter((coin) =>
      favCoinNames.includes(coin.name)
    );
    // console.log(fetchUserCoins);
    res.render("user/dashboard", {
      fetchedCoins: fetchUserCoins,
      userInfo: req.session.currentUser,
    });
  } catch (err) {
    console.log("smt weng wrong");
  }
});

router.post("/dashboard", isLoggedIn, async (req, res, next) => {
  try {
    const { unfavCoin } = req.body;
    console.log("thecoin will be removed", unfavCoin);

    const userId = req.session.currentUser._id;
    const response = await axios.get("https://api.coinlore.net/api/tickers/");
    const getUserFavs = await User.findById(userId);

    const favCoinNames = getUserFavs.favCoins;
    const removeItem = favCoinNames.indexOf(unfavCoin);
    if (removeItem !== -1) {
      favCoinNames.splice(removeItem, 1);
      await getUserFavs.save();
    }
    console.log(favCoinNames);
    if (favCoinNames.length === 0) {
      return res.render("user/dashboard", {
        message: "You have no coin faved",
        userInfo: req.session.currentUser,
      });
    }
    const fetchUserCoins = response.data.data.filter((coin) =>
      favCoinNames.includes(coin.name)
    );
    res.render("user/dashboard", {
      fetchedCoins: fetchUserCoins,
      userInfo: req.session.currentUser,
      message: "Coin removed successfully",
    });
  } catch (err) {
    console.log("smt went wrong while removing");
  }
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
    const userId = req.session.currentUser._id;
    const response = await axios.get("https://api.coinlore.net/api/tickers/");
    const coinData = response.data.data;
    const user = await User.findById(userId);
    if (user.favCoins.includes(favCoin)) {
      return res.render("user/coins", {
        coinData: coinData,
        message: "The coin is already in your favorite",
      });
    }
    user.favCoins.push(favCoin);
    await user.save();

    res.render("user/coins", {
      coinData: coinData,
      message: "Coin added to favorites successfully",
    });
  } catch (err) {
    res.render("user/coins", {
      message: " An error occurred while processing your request",
    });
  }
});

module.exports = router;
