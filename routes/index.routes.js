const express = require("express");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();
if (isLoggedIn) {
  router.get("/", isLoggedIn, (req, res, next) => {
    res.render("index");
  });
} else {
  router.get("/", isLoggedOut, (req, res, next) => {
    res.render("index");
  });
}

module.exports = router;
