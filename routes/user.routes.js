const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();
const axios = require("axios");
const Wallet = require("../models/Wallet.model");
const bcrypt = require("bcrypt");
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

router.get("/edit", (req, res) => {
  res.render("user/edit", { userInfo: req.session.currentUser });
});

router.post("/edit", async (req, res) => {
  const { name, email, currentPassword, newPassword, confirmNewPassword } =
    req.body;

  try {
    const user = await User.findById(req.session.currentUser._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.name = name;
    user.email = email;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).send("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.redirect("/user/edit-confirmation");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/edit-confirmation", (req, res) => {
  res.render("user/edit-confirmation", {
    userInfo: req.session.currentUser,
  });
});
module.exports = router;
