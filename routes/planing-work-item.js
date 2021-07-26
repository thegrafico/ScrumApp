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
    UNASSIGNED_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS,
    PRIORITY_POINTS,
    PAGES,
    joinData
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

    // get all the teams for this project
    let teams = [...projectInfo.teams];

    // get all sprints for project
    let sprints = await sprintCollection.find({projectId}).catch(err => console.log(err)) || [];

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];

    // LOADING TABLE WORK ITEMS
    workItems = await workItemCollection.find({projectId}).catch(err => 
        console.error("Error getting work items: ", err)
    ) || [];

    // Create new key (team/sprint) to store the work item team
    joinData(workItems, teams, "teamId", "equal", "_id", "team", UNASSIGNED);
    joinData(workItems, sprints, "_id", "is in", "tasks", "sprint", UNASSIGNED_SPRINT);

    //  GETTING USER BEST TEAM WHEN CREATING A WORK ITEM
    // get the team for the user in order to filter by it.
    let sprintForPreferedTeam = [];
    let activeSprintId = null;

    let userPreferedTeam = projectInfo.getUserPreferedTeam();

    // if the user have a team
    if (!_.isNull(userPreferedTeam)){
        // getting all sprints for team
        sprintForPreferedTeam = await sprintCollection.getSprintsForTeam(projectId, userPreferedTeam["_id"]).catch(err => {
            console.log(err);
        }) || [];
        let activeSprint = sprintCollection.getActiveSprint(sprintForPreferedTeam);
        
        if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){
            activeSprintId = activeSprint["_id"];
        }

    } 
    // === END
    console.log(teams)

    // adding defaults
    teams.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);
    users.unshift(UNASSIGNED);
    
    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "WorkItem,Planing",
        "tabTitle": "Work Items",
        "currentPage": PAGES.WORK_ITEMS,
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS,
        "projectTeams": teams, 
        "userTeam": userPreferedTeam["_id"],
        "sprints": sprintForPreferedTeam,
        "activeSprintId": activeSprintId,
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems,
        "priorityPoints": PRIORITY_POINTS,
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

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot the find the information of the project.");
        return res.redirect('/');
    }

    // TODO: Verify which project is the user in, and set that to be the selected in the frontend
    // get all the teams for this project
    let teams = [...projectInfo.teams];

    let sprints = await sprintCollection.find({projectId}).catch(err => console.log(err)) || [];

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];

    // Load work item specify data
    // TODO: this should be done first in order to know if the work item exist 
    let workItem = await projectInfo.getWorkItem(workItemId).catch(err => console.error("Error getting work items: ", err)) || [];
    
    if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        req.flash("error", "Cannot the work item information.");
        return res.redirect("back");
    }

    // adding defaults
    teams.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);
    users.unshift(UNASSIGNED);

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "WorkItem,Planing",
        "tabTitle": "Work Item",
        "currentPage": PAGES.UNIQUE_WORK_ITEM,
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS,
        "projectTeams": teams,
        "sprints": sprints,
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItem": workItem,
        "priorityPoints": PRIORITY_POINTS,
        "stylesPath": planigWorkItemPath["styles"],
        "scriptsPath": planigWorkItemPath["scripts"]
    };

    res.render("work-item", params);
});

module.exports = router;