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
    let projectInfo = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot find the project you're looking for.");
        return res.redirect('/');
    }

    let teams = [...projectInfo.teams];
    teams.unshift(UNASSIGNED);

    // get the team for the user in order to filter by it.
    let userBestTeam = undefined;
    let userTeams = [];
    if (teams.length > 1){
        userBestTeam = teams[1];
        userTeams = await projectInfo.getUsersForTeam(userBestTeam.id).catch(err => {
            console.error(err);
        }) || [];
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
        "userTeam": userBestTeam,
        "stylesPath": managePath["styles"],
        "scriptsPath": managePath["scripts"]
    };

    res.render("manage-teams", params);
});

module.exports = router;