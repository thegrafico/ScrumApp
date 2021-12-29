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
const WorkItemCollection        = require("../dbSchema/workItem");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { planigWorkItemPath }    = require("../middleware/includes");
const {
    UNASSIGNED, 
    UNASSIGNED_SPRINT,
    UNASSIGNED_USER,
    WORK_ITEM_STATUS_COLORS,
    MAIN_WORK_ITEMS_TO_SHOW,
    PRIORITY_POINTS,
    PAGES,
    joinData,
    sortByDate,
    addUserNameToComment,
} = require('../dbSchema/Constanst');

/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/workitems", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;

    const projectInfo = req.currentProject;

    let { showOnlyMine } = req.query;

    // show only work items for the current user
    showOnlyMine = (showOnlyMine === 'true');

    // get all the teams for this project
    let teams = [...projectInfo.teams];

    // get all sprints for project
    let sprints = await sprintCollection.find({projectId}).catch(err => console.error(err)) || [];

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.error(err)) || [];

    // LOADING TABLE WORK ITEMS. We're not showing completed, deleted and abandoned
    let workItems = [];
    
    // load just the current user work items
    if (showOnlyMine) {

        // 0 because we want to fetch all user work items
        workItems = await WorkItemCollection.getUserWorkItems(projectId, req.user["_id"], 0).catch(err => {
            console.error("Error getting user work items: ", err);
        });

    // load all project work items
    }else{
        workItems =  await WorkItemCollection.find({projectId, status: {$in: MAIN_WORK_ITEMS_TO_SHOW}}).lean().catch(err => 
            console.error("Error getting work items: ", err)
        ) || [];
    }

    // sorting the work items. SORT
    workItems = sortByDate(workItems, "createdAt");

    // Create new key (team/sprint) to store the work item team
    joinData(workItems, teams, "teamId", "equal", "_id", "team", UNASSIGNED, true);
    joinData(workItems, sprints, "_id", "is in", "tasks", "sprint", UNASSIGNED_SPRINT);

    // adding defaults
    teams.unshift(UNASSIGNED);
    users.unshift(UNASSIGNED_USER);

    // populating params
    let params = {
        "title": (projectInfo["title"] + " - Work Items"),
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": (showOnlyMine ? "MyWorkItems" : "WorkItem"),
        "tabTitle": (showOnlyMine ? "My Work Items" : "Work Items"),
        "currentPage": PAGES.WORK_ITEMS,
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams, 
        "userTeam": null,
        "sprints": [UNASSIGNED],
        "activeSprintId": null,
        "addUserModal": true,
        "workItems": workItems,
        "priorityPoints": PRIORITY_POINTS,
        "stylesPath": planigWorkItemPath["styles"],
        "scriptsPath": planigWorkItemPath["scripts"],
        "showCreateWorkItemModal": true,
    };

    res.render("work-items", params);
});

/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/workitems/:workItemId", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    const projectInfo = req.currentProject;

    // ============== CHECK WORK ITEM INFO ==============
    // Load work item specify data
    let workItem = await projectInfo.getWorkItem(workItemId).catch(err => {
        console.error("Error getting work items: ", err);
    }) || {};


    if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        req.flash("error", "Cannot the work item information.");
        return res.redirect("back");
    }

    workItem = workItem.toObject();
    // ===================================================

    // set the links for the work item
    await WorkItemCollection.setRelationship(workItem).catch(err => {
        console.error("Error setting the relationship for the work item: ", err);
    });

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.error("Error getting the users: ", err)) || [];
    
    // update the comments
    workItem["comments"] = addUserNameToComment(workItem["comments"], users, req.user["_id"]);


    // get all the teams for this project
    let teams = [...projectInfo.teams];

    let workItemTeam = teams.filter( each => {return (each["_id"] || "").toString() ==( workItem["teamId"] || "").toString()})[0];

    let sprints = [];
    let workItemSprintId = UNASSIGNED["_id"];

    // if the user have a team
    if (_.isObject(workItemTeam) && !_.isEmpty(workItemTeam)){

        // getting all sprints for team
        sprints = await sprintCollection.getSprintsForTeam(projectId, workItemTeam["_id"]).catch(err => {
            console.error("Error getting sprints for team: ", err)
        }) || [];  

        // getting the sprint this work item belongs 
        let workItemSprint = sprints.filter( each => {
            return each.tasks.includes(workItem["_id"].toString());
        })[0];

        if (_.isObject(workItemSprint) && !_.isEmpty(workItemSprint)){
            workItemSprintId = workItemSprint["_id"];
        }

        sprints = sortByDate(sprints, "startDate");
    }

    // adding defaults
    teams.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);
    users.unshift(UNASSIGNED_USER);

    // populating params
    let params = {
        "title": (projectInfo["title"] + " - Work Item: " + workItem["itemId"]),
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "WorkItem,Planing",
        "tabTitle": "Work Item",
        "currentPage": PAGES.UNIQUE_WORK_ITEM,
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams,
        "activeSprintId": workItemSprintId,
        "sprints": sprints,
        "addUserModal": true,
        "workItem": workItem,
        "priorityPoints": PRIORITY_POINTS,
        "stylesPath": planigWorkItemPath["styles"],
        "scriptsPath": planigWorkItemPath["scripts"],
    };

    res.render("work-item", params);
});

module.exports = router;