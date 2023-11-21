const express = require("express");
const router = express.Router();
const axios = require("axios");

/* GET home page */
//!to prevent unnecessary api call i commented it
router.get("/", (req, res, next) => {
  axios
    .get(
      "https://newsdata.io/api/1/news?apikey=pub_331297f2115fb2e3329df632dc74768a0f24f&q=Crypto%20currency"
    )
    .then((response) => {
      //console.log(response.data);
      res.render("index", { news: response.data });
    })
    .catch((err) => {
      console.log(err);
      res.render("index", { news: [] });
    });
});

module.exports = router;
