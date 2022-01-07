/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express                   = require("express");
const _                         = require("lodash");
const sprintCollection          = require("../dbSchema/sprint");
const workItemCollection        = require("../dbSchema/workItem");
const middleware                = require("../middleware/auth");
let router                      = express.Router();
const { backlogPath }    = require("../middleware/includes");


const {
    UNASSIGNED, 
    UNASSIGNED_SPRINT,
    UNASSIGNED_USER,
    UNASSIGNED_TEAM,
    WORK_ITEM_STATUS_COLORS,
    PRIORITY_POINTS,
    PAGES,
    sortByDate,
    joinData
} = require('../dbSchema/Constanst');


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id/backlog", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;
    const projectInfo = req.currentProject;
    let workItems = [];

    // get all the teams for this project
    let teams = [...projectInfo.teams];

    // get the team for the user in order to filter by it.
    let userPreferedTeam = projectInfo.getUserPreferedTeam();
    let sprints = [];

    // to get the work items
    let query_work_item = {};

    // if the user have a team
    if (!_.isNull(userPreferedTeam) && userPreferedTeam["_id"] != "0"){
        query_work_item["teamId"] = userPreferedTeam["_id"];

        // getting all sprints for team
        sprints = await sprintCollection.getSprintsForTeam(projectId, userPreferedTeam["id"]).catch(err => {
            console.error(err)
        }) || [];

        query_work_item["projectId"] = projectId;
        workItems = await workItemCollection.find(query_work_item).catch(err => console.error("Error getting work items: ", err)) || [];
        
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
    
    }

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.error(err)) || [];

    // sorting sprint by date
    sprints = sortByDate(sprints, "startDate");

    // Add team to work item to be able to has the work item id
    joinData(workItems, teams, "teamId", "equal", "_id", "team", UNASSIGNED_TEAM, true);

    // adding defaults
    teams.unshift(UNASSIGNED_TEAM);
    users.unshift(UNASSIGNED_USER);
    sprints.unshift(UNASSIGNED_SPRINT);
    console.log(userPreferedTeam);

    // populating params
    let params = {
        "title": (projectInfo["title"] + " - Backlog"),
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Backlog,Planing",
        "tabTitle": "Backlog",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams,
        "sprints": sprints,
        "activeSprintId": UNASSIGNED["_id"],
        "addUserModal": true,
        "workItems": workItems,
        "currentPage": PAGES.BACKLOG,
        "userTeam": userPreferedTeam["_id"],
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": backlogPath["styles"],
        "scriptsPath": backlogPath["scripts"],
        "showCreateWorkItemModal": true,
    };

    res.render("backlog", params);
});

module.exports = router;