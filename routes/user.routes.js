const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const router = express.Router();

router.get("/dashboard", isLoggedIn, (req, res, next) => {
  res.render("user/dashboard", { userInfo: req.session.currentUser });
});

module.exports = router;
