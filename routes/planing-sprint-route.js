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
const workItemCollection        = require("../dbSchema/workItem");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { sprintPath }            = require("../middleware/includes");


const {
    SPRINT_DEFAULT_PERIOD_TIME,
    SPRINT_STATUS,
    UNASSIGNED, 
    UNASSIGNED_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS_COLORS,
    PRIORITY_POINTS,
    PAGES,
    SPRINT_FORMAT_DATE,
    sortByDate,
} = require('../dbSchema/Constanst');

// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/planing/sprint", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // verify is the project exists
    let projectInfo = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot find the project you're looking for.");
        return res.redirect('/');
    }

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];

    // TODO: Verify which project is the user in, and set that to be the selected in the frontend
    // get all the teams for this project
    let teams = [...projectInfo.teams];

    // get the team for the user in order to filter by it.
    let userPreferedTeam = projectInfo.getUserPreferedTeam();
    
    let sprints = [];
    let workItems = [];
    let activeSprintId = undefined;

    // if there is a least one team.
    if (!_.isNull(userPreferedTeam)){

        // get the active sprint for this project
        sprints = await SprintCollection.getSprintsForTeam(projectId, userPreferedTeam._id).catch(err => {
            console.log(err);
        }) || [];

        // check sprint
        if (!_.isEmpty(sprints) || !_.isUndefined(sprints) || !_.isNull(sprints)){
            
            let currentDate = moment(new Date()); // now

            // TODO: look a better place for this
            SprintCollection.updateSprintsStatus(projectId, currentDate);
            
            let activeSprint = SprintCollection.getActiveSprint(sprints);

            // check we have an active sprint
            if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){
                activeSprintId = activeSprint["_id"];
            }

            // get the work items by the sprint
            workItems = await workItemCollection.find({projectId: projectId, _id: {$in: activeSprint.tasks}}).catch(err => {
                console.error("Error getting work items: ", err)
            }) || [];
        }
    }

    sprints = sortByDate(sprints, "startDate");

    // add default values
    teams.unshift(UNASSIGNED);
    users.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);


    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "SprintPlaning,Planing",
        "tabTitle": "Sprint Planning",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams,
        "sprints": sprints,
        "activeSprintId": activeSprintId,
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems,
        "currentPage": PAGES.SPRINT,
        "userTeam": userPreferedTeam["_id"],
        "sprintDefaultTimePeriod": SPRINT_DEFAULT_PERIOD_TIME, // Here the user can selet the time, but defualt is two weeks
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": sprintPath["styles"],
        "scriptsPath": sprintPath["scripts"]
    };

    res.render("planing-sprint", params);
});

module.exports = router;



