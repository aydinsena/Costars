module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.session.currentUser) {
    res.locals.isLoggedin = false;
    return res.redirect("/auth/login");
  }
  res.locals.isLoggedin = true;
  next();
};
