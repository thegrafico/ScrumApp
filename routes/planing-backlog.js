/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express               = require("express");
const _                     = require("lodash");
const validator             = require("validator");
const STATUS                = require('../models/Constanst').projectStatus;
const moment                = require('moment');
const projectCollection     = require("../models/projects");
const userCollection        = require("../models/user");
const projectUserCollection = require("../models/projectUsers");
const middleware            = require("../middleware/auth");
let router                  = express.Router();
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/planing/backlog", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // verify is the project exists
    let projectInfo = await projectCollection.findOne({
        _id: projectId
    }).catch(err => {
        console.log("Error is: ", err.reason);
    });

    // console.log("Project information: ", projectInfo);

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        // TODO: show a message to the user
        return res.redirect('/');
    }

    // populating params
    let params = {
        "project": projectInfo,
        "projectId": projectId,
        "projectStatus": STATUS,
        "activeTab": "Backlog,Planing",
        "tabTitle": "Backlog",
        "assignedUsers": [{name:"Raul Pichardo", val: "01"}, {name: "Lana Pichardo", val: "02"}],
        "statusWorkItem": STATUS,
        "teamWorkItem": [{name: "Team Awesome", val: "01"}, {name: "Team Batman", val: "02"}],
        "sprints": [{name: "Sprint 1", val: "01"}, {name: "Sprint 2", val: "02"}, {name: "Sprint 3", val: "03"}]
    };
   

    res.render("planing-backlog", params);
});

module.exports = router;