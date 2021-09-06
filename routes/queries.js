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
const OrderSprintCollection     = require("../dbSchema/sprint-order");
const workItemCollection        = require("../dbSchema/workItem");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { queryPath }            = require("../middleware/includes");


const {
    SPRINT_DEFAULT_PERIOD_TIME,
    SPRINT_STATUS,
    UNASSIGNED, 
    UNASSIGNED_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS_COLORS,
    PRIORITY_POINTS,
    WORK_ITEM_STATUS,
    PAGES,
    SPRINT_FORMAT_DATE,
    sortByDate,
    sortByOrder,
    setSprintOrder,
    updateSprintOrderIndex,
    QUERY_OPERATOR,
    QUERY_FIELD,
} = require('../dbSchema/Constanst');

// ===================================================

/**
 * METHOD: GET - Sprint planning
 */
router.get("/:id/queries", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;

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

    let sprints = [];
    let workItems = [];
    // add default values
    teams.unshift(UNASSIGNED);
    users.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "ProjectQueries",
        "tabTitle": "Queries",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams,
        "sprints": sprints,
        "activeSprintId": "",
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": [],
        "currentPage": PAGES.QUERIES,
        "userTeam": undefined,
        "sprintDefaultTimePeriod": SPRINT_DEFAULT_PERIOD_TIME, // Here the user can selet the time, but defualt is two weeks
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": queryPath["styles"],
        "scriptsPath": queryPath["scripts"],
        "queryOperator": QUERY_OPERATOR,
        "queryFields": QUERY_FIELD,

    };

    res.render("queries", params);
});


module.exports = router;



