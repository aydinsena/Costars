module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.session.currentUser) {
    res.locals.isLoggedin = false;
    return res.render("index");
  }
  res.locals.isLoggedin = true;

  next();
};
