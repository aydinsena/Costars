const express = require("express");
const router = express.Router();

router.get("user/dashboard", (req, res, next) => {
  res.render("user/dashboard", { userInfo: req.session.currentUser });
});

module.exports = router;
