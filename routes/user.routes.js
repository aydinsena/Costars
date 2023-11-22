const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();
const axios = require("axios");
const Wallet = require("../models/Wallet.model");
const bcrypt = require("bcrypt");
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

router.get("/wallet", isLoggedIn, async (req, res, next) => {
  const apiCall = await axios.get("https://api.coinlore.net/api/tickers/");
  const userId = req.session.currentUser._id;
  const findUser = await User.findById(userId).populate("walletentity");
  const currentPrices = [];
  const amountsHeld = [];
  let totalWorth = 0;

  const bringWalletValues = findUser.walletentity.walletvalues.forEach((e) => {
    amountsHeld.push(e.amount);
    const findCoinAPI = apiCall.data.data.find((coin) => coin.name === e.name);
    currentPrices.push(findCoinAPI.price_usd);
  });
  totalWorth = currentPrices.reduce((sum, value, index) => {
    return sum + value * amountsHeld[index];
  }, 0);
  await res.render("user/wallet", {
    userInfo: req.session.currentUser,
    data: apiCall.data,
    walletInfo: findUser.walletentity.walletvalues,
    walletTotal: findUser.walletentity.total,
    apiCurrentValue: currentPrices,
    totalWorth,
  });
});

router.post("/wallet", isLoggedIn, async (req, res, next) => {
  try {
    let totalValue = 0;
    const apiCall = await axios.get("https://api.coinlore.net/api/tickers/");
    const { name, amount } = req.body;
    const userId = req.session.currentUser._id;
    const findUser = await User.findById(userId).populate("walletentity");
    const findInApi = await apiCall.data.data.find(
      (coin) => coin.name === name
    );
    const sumValue = (amount * findInApi.price_usd).toFixed(3);
    const updatedWalletValue = {
      name,
      amount,
      currentPrice: findInApi.price_usd,
      sum: sumValue,
    };

    findUser.walletentity.walletvalues.push(updatedWalletValue);
    await findUser.walletentity.save();

    const calculateTotal = await findUser.walletentity.walletvalues.forEach(
      (e) => {
        totalValue += parseFloat(e.sum);
      }
    );
    const changeTotal = await Wallet.findById(findUser.walletentity);

    changeTotal.total = totalValue.toFixed(3);
    await changeTotal.save();

    await res.redirect("/user/wallet");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/wallet-delete", isLoggedIn, async (req, res, next) => {
  try {
    const { coinForm } = req.body;
    const userId = req.session.currentUser._id;
    const findUser = await User.findById(userId).populate("walletentity");
    const walletValues = findUser.walletentity.walletvalues;
    const findSameCoin = walletValues.find((coin) => coin.name === coinForm);
    const removeItem = walletValues.indexOf(findSameCoin);
    console.log(removeItem);
    const walletId = findUser.walletentity._id;
    console.log(walletId);
    if (removeItem !== -1) {
      walletValues.splice(removeItem, 1);
    }
    await findUser.save();
    console.log(findSameCoin, "same coin ");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/coins", isLoggedIn, (req, res, next) => {
  axios.get("https://api.coinlore.net/api/tickers/").then((response) => {
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
      message: "An error occurred while processing your request",
    });
  }
});

router.get("/news", isLoggedIn, async (req, res, next) => {
  const options = {
    method: "GET",
    url: "https://cryptocurrency-news2.p.rapidapi.com/v1/coindesk",
    headers: {
      "X-RapidAPI-Key": "9b8e009986msh929dbcc05479ff0p1fdbd1jsn5d7df59cce93",
      "X-RapidAPI-Host": "cryptocurrency-news2.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.render("user/news", { news: response.data });
  } catch (error) {
    res.render("user/news", { news: [] });
    console.error(error);
  }
});
router.get("/edit", isLoggedIn, (req, res) => {
  res.render("user/edit", { userInfo: req.session.currentUser });
});

router.post("/edit", isLoggedIn, async (req, res) => {
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
      return res.render("user/edit", {
        userInfo: user,
        errorMessage:
          "The newly entered password does not match the confirmed password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.render("user/edit", {
        userInfo: user,
        errorMessage: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.render("user/edit", {
      userInfo: user,
      successMessage: "Profile updated successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

// Add this route to your existing code
router.post("/delete", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.currentUser._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (await User.findByIdAndDelete(req.session.currentUser._id)) {
      console.log("User deleted successfully");
    }

    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error occurred during deletion");
      }
      return res.redirect("/");
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
