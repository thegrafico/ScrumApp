/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express                   = require("express");
const _                         = require("lodash");
const moment                    = require('moment');
const projectCollection         = require("../dbSchema/projects");
const sprintCollection          = require("../dbSchema/sprint");
const workItemCollection        = require("../dbSchema/workItem");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { managePath }           = require("../middleware/includes");


const {
    UNASSIGNED, 
    EMPTY_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS,
    PRIORITY_POINTS,
} = require('../dbSchema/Constanst');

// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/manageTeam", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // verify is the project exists
    let projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot find the project you're looking for.");
        return res.redirect('/');
    }

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];
    let teams = [...projectInfo.teams];

    // get the team for the user in order to filter by it.
    // TODO: refactor code below
    let userBestTeam = undefined;
    let userTeams = [];
    let userIds = [];
    if (teams.length > 0){
        userBestTeam = teams[1];
        userTeams = await projectInfo.getUsersForTeam(userBestTeam.id).catch(err => {
            console.error(err);
        }) || [];
        userIds = userTeams.map( each => each._id.toString());
    }

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Statistics",
        "tabTitle": "Manage Teams",
        "teamWorkItem": teams,
        "teamUsers": userTeams,
        "projectUsers": users,
        "assignedUsers": users,
        "addUserModal": true,
        "userIds": userIds,
        "userTeam": userBestTeam,
        "stylesPath": managePath["styles"],
        "scriptsPath": managePath["scripts"]
    };

    res.render("manage-teams", params);
});

module.exports = router;