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
const { sprintPath }            = require("../middleware/includes");


const {
    SPRINT_DEFAULT_PERIOD_TIME,
    UNASSIGNED, 
    UNASSIGNED_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS,
    PRIORITY_POINTS,
    PAGES,
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
    
    let query_work_item = {};

    // TODO: Verify which project is the user in, and set that to be the selected in the frontend
    // get all the teams for this project
    let teams = [...projectInfo.teams];
    teams.unshift(UNASSIGNED);

    // get the team for the user in order to filter by it.
    let userBestTeam = null;
    let sprints = [];
    if (teams.length > 1){
        userBestTeam = teams[1];
        query_work_item["teamId"] = userBestTeam.id;
        sprints = await sprintCollection.find({projectId, teamId: userBestTeam}).catch(err => console.log(err)) || [];
    }
    sprints.unshift(UNASSIGNED_SPRINT);
    
    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];
    users.unshift(UNASSIGNED);

    // LOADING TABLE WORK ITEMS
    query_work_item["projectId"] = projectId;
    const workItems = await workItemCollection.find(query_work_item).catch(err => console.error("Error getting work items: ", err)) || [];
    
    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "SprintPlaning,Planing",
        "tabTitle": "Sprint Planning",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS,
        "projectTeams": teams,
        "sprints": sprints,
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems,
        "currentPage": PAGES.SPRINT,
        "userTeam": userBestTeam,
        "sprintDefaultTimePeriod": SPRINT_DEFAULT_PERIOD_TIME, // Here the user can selet the time, but defualt is two weeks
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": sprintPath["styles"],
        "scriptsPath": sprintPath["scripts"]
    };

    res.render("planing-sprint", params);
});

module.exports = router;




/**
 * 
 * testing-req-config
 * 
 * Spec folder
 * 
 * Client: 
 *  src/test/java
 *      Test Application
 *  src/test/resource
 * 
 * In static folder will be my code service in test/resource
 * then to run that test I need to add it in the testing req-config
 * create a new file in the services folder
 * To running the test -> Test Application
 * if you had run client verify, then is not available
 */