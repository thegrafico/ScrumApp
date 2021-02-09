/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express = require("express");
const valid = require("validator");
const _ = require("lodash");
const passport = require("passport");
const User = require('../models/user');

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

/**
 * METHOD: POST - Create a new project
 */
//POST LOGIN - we use the midleware to autenticar el usuario
// router.post("/", passport.authenticate("local",
// 	{
// 		successRedirect: "/", // si el usuario se encuentra en la DB pues BIEN
// 		faiulerRedirect: "/login"	// si no se encuentra pues va aqui
// 	}) ,function(req, res){
// });

// router.post("/", async function (req, res) {
//   console.log(req.body);
//   res.redirect('/login');
// });

//POST LOGIN - we use the midleware to autenticar el usuario
router.post("/", passport.authenticate("local", {
    failureRedirect: "/login", //si no se encuentra pues va aqui
  }),
  function (req, res) {
    res.redirect('/');
  }
);

module.exports = router;
