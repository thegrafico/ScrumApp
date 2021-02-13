/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
*/

// ============= CONST AND DEPENDENCIES =============
const express = require("express");
const _ = require("lodash");
let projectCollection = require("../models/projects");

let router = express.Router();

// JUST FOR TESTING
const userId = "601782de1fb2050e11bfbf1f";
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id", async function (req, res) {
    let projectId = req.params.id;

    // verify is the project exists
    // TODO: verify if the user can access to the project
    let response = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(response) || _.isEmpty(response)){
        // TODO: show a message to the user
        return res.redirect('/');
    }
    let params = {title: "Project"};
    res.render("projectDetail", params);
});

module.exports = router;
