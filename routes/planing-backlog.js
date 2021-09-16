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
const { backlogPath }    = require("../middleware/includes");


const {
    UNASSIGNED, 
    UNASSIGNED_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS_COLORS,
    PRIORITY_POINTS,
    PAGES,
    sortByDate
} = require('../dbSchema/Constanst');

// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/planing/backlog", middleware.isUserInProject, async function (req, res) {

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

    // get the team for the user in order to filter by it.
    let userPreferedTeam = projectInfo.getUserPreferedTeam();

    let sprints = null;
    let activeSprintId = null;

    // to get the work items
    let query_work_item = {};

    // if the user have a team
    if (!_.isNull(userPreferedTeam)){
        query_work_item["teamId"] = userPreferedTeam["_id"];

        // getting all sprints for team
        sprints = await sprintCollection.getSprintsForTeam(projectId, userPreferedTeam["id"]).catch(err => {
            console.log(err)
        }) || [];

        let activeSprint = sprintCollection.getActiveSprint(sprints);
        
        if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){
            activeSprintId = activeSprint["_id"];
        }
    }

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];

    // LOADING TABLE WORK ITEMS
    query_work_item["projectId"] = projectId;
    let workItems = await workItemCollection.find(query_work_item).catch(err => console.error("Error getting work items: ", err)) || [];
    
    for (let i = 0; i < workItems.length; i++) {
        // workItems[i]["sprint"] = UNASSIGNED_SPRINT;
        workItems[i]["show"] = true;
        for (let sprint of sprints){
            let isInSprint = sprint && sprint.tasks && sprint.tasks.includes(workItems[i]._id.toString());
            if (isInSprint){
                workItems[i]["show"] = false;
                break;
            }
        }
    }

    // sorting sprint by date
    sprints = sortByDate(sprints, "startDate");

    // adding defaults
    teams.unshift(UNASSIGNED);
    users.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Backlog,Planing",
        "tabTitle": "Backlog",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams,
        "sprints": sprints,
        "activeSprintId": activeSprintId,
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems,
        "currentPage": PAGES.BACKLOG,
        "userTeam": userPreferedTeam["_id"],
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": backlogPath["styles"],
        "scriptsPath": backlogPath["scripts"],
        "showCreateWorkItemModal": true,
    };

    res.render("planing-backlog", params);
});

module.exports = router;