/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express = require("express");
const passport = require("passport");

let router = express.Router();
// ===================================================

/**
 * METHOD: GET - show the main page for projects
 */
router.get("/", async function (req, res) {

  let params = {
    title: "Login",
  };

  res.render("login", params);
});


//POST LOGIN - we use the midleware to autenticar el usuario
router.post("/", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,

  }),
  function (req, res) {
    req.flash("success", `Welcome Back ${req.user.fullName}!`);
    res.redirect('/');
  }
);

/**
 * METHOD: GET - show the main page for projects
 */
router.get("/logout", async function (req, res) {
  req.logOut();
  res.redirect('/login');
});


module.exports = router;
