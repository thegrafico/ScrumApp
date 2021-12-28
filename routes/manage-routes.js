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
const SprintCollection          = require("../dbSchema/sprint");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { managePath }           = require("../middleware/includes");


const {
    PAGES,
    UNASSIGNED, 
    WORK_ITEM_STATUS_COLORS,
    PRIORITY_POINTS,
    UNASSIGNED_USER,
    sortByDate,
    USER_PRIVILEGES,
} = require('../dbSchema/Constanst');


/**
 * METHOD: GET - SHOW USERS manages
 */
router.get("/:id/manageUsers", middleware.isUserInProject, async function (req, res) {

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
    let users = await projectInfo.getUsersWithPrivilege().catch(err => console.log(err)) || [];
    let teams = [...projectInfo.teams];

    users.unshift(UNASSIGNED_USER);
    teams.unshift(UNASSIGNED);

    // populating params
    let params = {
        "title": (projectInfo["title"] + " - Manage Users"),
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Statistics",
        "tabTitle": "Manage Users",
        "projectTeams": teams,
        "projectUsers": users,
        "assignedUsers": users,
        "addUserModal": true,
        "currentPage": PAGES.MANAGE_USER,
        "stylesPath": managePath["styles"],
        "scriptsPath": managePath["scripts"],
        "sprints": [],
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "priorityPoints":PRIORITY_POINTS,
        "userPrivilege": USER_PRIVILEGES,
    };

    res.render("manage-users", params);
});

/**
 * METHOD: GET - Show Teams Manages
 */
router.get("/:id/manageTeam", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // verify is the project exists
    let projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot find the project you're looking for.");
        return res.redirect('/');
    }

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];
    let teams = [...projectInfo.teams];

    // populating params
    let params = {
        "title": (projectInfo["title"] + " - Manage Teams"),
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Statistics",
        "tabTitle": "Manage Teams",
        "projectTeams": teams,
        "projectUsers": users,
        "assignedUsers": users,
        "addUserModal": true,
        "sprints": [],
        "currentPage": PAGES.MANAGE_TEAM,
        "stylesPath": managePath["styles"],
        "scriptsPath": managePath["scripts"],
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "priorityPoints":PRIORITY_POINTS,
    };

    res.render("manage-teams", params);
});

/**
 * METHOD: GET - Show Sprint Manages
 */
router.get("/:id/manageSprints", middleware.isUserInProject, async function (req, res) {

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

    //  ===== Data for create work item ====
    // get the team for the user in order to filter by it.
    let userPreferedTeam = projectInfo.getUserPreferedTeam();
    let sprintForPreferedTeam = [];
    let activeSprintId = null;
    let userTeams = [];
    let userIds = [];

    // if the user have a team
    if (!_.isNull(userPreferedTeam) || !_.isEmpty(userPreferedTeam)){
        // getting all sprints for team
        sprintForPreferedTeam = await SprintCollection.getSprintsForTeam(projectId, userPreferedTeam["_id"]).catch(err => {
            console.log(err);
        }) || [];

        userTeams = await projectInfo.getUsersForTeam(userPreferedTeam["_id"].toString()).catch(err => {
            console.error(err);
        }) || [];

        userIds = userTeams.map( each => each._id.toString());

        let activeSprint = SprintCollection.getActiveSprint(sprintForPreferedTeam);
        
        // check we have an active sprint
        if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){
            activeSprintId = activeSprint["_id"];
        }
    }

    // sorting by date
    sprintForPreferedTeam = sortByDate(sprintForPreferedTeam, "startDate");

    // populating params
    let params = {
        "title": (projectInfo["title"] + " - Manage Sprints"),
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Statistics",
        "tabTitle": "Manage Sprints",
        "projectTeams": teams,
        "teamUsers": userTeams,
        "projectUsers": users,
        "assignedUsers": users,
        "addUserModal": true,
        "sprints": sprintForPreferedTeam,
        "activeSprintId": activeSprintId,
        "currentPage": PAGES.MANAGE_SPRINT,
        "userIds": userIds,
        "userTeam": userPreferedTeam,
        "stylesPath": managePath["styles"],
        "scriptsPath": managePath["scripts"],
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "priorityPoints":PRIORITY_POINTS,
    };

    res.render("manage-sprints", params);
});

module.exports = router;