/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express                   = require("express");
const _                         = require("lodash");
const STATUS                    = require('../dbSchema/Constanst').projectStatus;
const moment                    = require('moment');
const projectCollection         = require("../dbSchema/projects");
const sprintCollection          = require("../dbSchema/sprint");
const workItemCollection        = require("../dbSchema/workItem");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { planigWorkItemPath }    = require("../middleware/includes");
const {
    UNASSIGNED, 
    EMPTY_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS,
    PRIORITY_POINTS,
} = require('../dbSchema/Constanst');

/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/planing/workitems", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // verify is the project exists
    let projectInfo = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot find the project you're looking for.");
        return res.redirect('/');
    }

    // TODO: Verify which project is the user in, and set that to be the selected in the frontend
    // get all the teams for this project
    let teams = [...projectInfo.teams];
    teams.unshift(UNASSIGNED);

    let sprints = await sprintCollection.find({projectId}).catch(err => console.log(err)) || [];
    sprints.unshift(EMPTY_SPRINT);

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];
    users.unshift(UNASSIGNED);

    // LOADING TABLE WORK ITEMS
    workItems = await workItemCollection.find({projectId}).catch(err => 
        console.error("Error getting work items: ", err)
    ) || [];
    
    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "WorkItem,Planing",
        "tabTitle": "Work Items",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS,
        "teamWorkItem": teams,
        "sprints": sprints,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems,
        "stylesPath": planigWorkItemPath["styles"],
        "scriptsPath": planigWorkItemPath["scripts"]
    };

    res.render("planing-work-item", params);
});

/**
 * METHOD: GET - show the main page for projects
 */
 router.get("/:id/planing/workitems/:workItemId", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;
    const workItemId = req.params.workItemId;

    // verify is the project exists
    let projectInfo = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    console.log(projectInfo.teams);

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        // TODO: show a message to the user
        return res.redirect('/');
    }

    // TODO: Verify which project is the user in, and set that to be the selected in the frontend
    // get all the teams for this project
    let teams = [...projectInfo.teams];
    teams.unshift(UNASSIGNED);

    let sprints = await sprintCollection.find({projectId}).catch(err => console.log(err)) || [];
    sprints.unshift(EMPTY_SPRINT);

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];
    users.unshift(UNASSIGNED);

    // Load work item specify data
    // TODO: this should be done first in order to know if the work item exist 
    let workItem = await projectInfo.getWorkItem(workItemId).catch(err => console.error("Error getting work items: ", err)) || [];
    
    if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        // TODO: show a redirect message to the user
        console.error("Cannot get workItem requested.");
        return res.redirect("back");
    }

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "WorkItem,Planing",
        "tabTitle": "Work Item",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS,
        "teamWorkItem": teams,
        "sprints": sprints,
        "workItemType": WORK_ITEM_ICONS,
        "workItem": workItem,
        "priorityPoints": PRIORITY_POINTS,
        "stylesPath": planigWorkItemPath["styles"],
        "scriptsPath": planigWorkItemPath["scripts"]
    };

    res.render("work-item", params);
});

module.exports = router;