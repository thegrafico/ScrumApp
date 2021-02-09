/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express = require("express");
const valid = require("validator");
const _ = require("lodash");

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
router.post("/", function (req, res) {
  res.redirect("/");
});

module.exports = router;
