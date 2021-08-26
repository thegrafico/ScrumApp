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
const { sprintPath, sprintReview, sprintBoard }            = require("../middleware/includes");


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
    getNumberOfElements,
    getNumberOfDays,
    getPointsForStatus,
    filteByStatus,
    sortByOrder,
} = require('../dbSchema/Constanst');

// ===================================================


/**
 * METHOD: GET - Sprint review
 */
router.get("/:id/sprint/review", middleware.isUserInProject, async function (req, res) {

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
    let activeSprint = undefined;
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

            // activeSprint = await SprintCollection.getSprintById(projectId, "60fcf6679dd6b4759dbcbe43").catch(err =>{
            //     console.error(err);
            // }) || [];
            
            activeSprint = SprintCollection.getActiveSprint(sprints);

            // check we have an active sprint
            if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){
                activeSprintId = activeSprint["_id"];
            }

            if (activeSprintId){

                // get the work items by the sprint
                workItems = await workItemCollection.find({projectId: projectId, _id: {$in: activeSprint.tasks}}).catch(err => {
                    console.error("Error getting work items: ", err)
                }) || [];

            }

        }
    }

    let numberOfDays = 0;
    let startDate = '', endDate = '';
    let pointsHistory = [];
    let initalSprintPoints = 0;

    if (activeSprint){
        startDate = activeSprint["startDate"];
        endDate = activeSprint["endDate"];
        pointsHistory = activeSprint["pointsHistory"];
        initalSprintPoints = activeSprint["initialPoints"];
        numberOfDays  = getNumberOfDays(startDate, endDate);
    }

    let statusReport = {
        totalPoints: getPointsForStatus(workItems, null),
        completedPoints: getPointsForStatus(workItems, WORK_ITEM_STATUS["Completed"]),
        incompletedPoints: getPointsForStatus(workItems, WORK_ITEM_STATUS["Completed"], true),
        numberOfWorkItems: workItems.length, 
        numberOfWorkItemsCompleted: getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"]),
        numberOfWorkItemsIncompleted: getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"], true),
        capacity: users.length,
        numberOfDays: numberOfDays,
        startDate: startDate,
        endDate: endDate,
        initalSprintPoints: initalSprintPoints,
        pointsHistory: pointsHistory,
    };

    sprints = sortByDate(sprints, "startDate");
    workItems = sortByDate(workItems, "updatedAt", null, "desc");

    // add default values
    teams.unshift(UNASSIGNED);
    users.unshift(UNASSIGNED);
    sprints.unshift(UNASSIGNED_SPRINT);

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "SprintReview,Sprint",
        "tabTitle": "Sprint Review",
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
        "stylesPath": sprintReview["styles"],
        "scriptsPath": sprintReview["scripts"],
        "showCompletedWorkItems": true,
        "statusReport": statusReport,

    };

    res.render("sprint-review", params);
});


/**
 * METHOD: GET - Sprint Board
 */
router.get("/:id/sprint/board", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // check if there is a sprint id to look for
    let { sprintId }  = req.query;

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
    let userPreferedTeam = {};
    
    if (!sprintId){
        userPreferedTeam = projectInfo.getUserPreferedTeam();
    }

    let userTeamId = undefined;
    let sprints = [];
    let workItems = [];
    let activeSprintId = undefined;
    let activeSprint = {};

    // if there is a least one team.
    if (!_.isNull(userPreferedTeam) || sprintId){

        if (sprintId){
            // 60fcf6679dd6b4759dbcbe43
            activeSprint = await SprintCollection.getSprintById(projectId, sprintId).catch(err =>{
                console.error(err);
            }) || {};
        }

        userTeamId = activeSprint["teamId"] || userPreferedTeam["_id"];

        // get the active sprint for this project
        sprints = await SprintCollection.getSprintsForTeam(projectId,  userTeamId).catch(err => {
            console.error(err);
        }) || [];
 
        // check sprint
        if (!_.isEmpty(sprints) || !_.isUndefined(sprints) || !_.isNull(sprints)){
            
            let currentDate = moment(new Date()); // now

            // TODO: look a better place for this
            SprintCollection.updateSprintsStatus(projectId, currentDate);
            
            if (!sprintId){
                activeSprint = SprintCollection.getActiveSprint(sprints);
            }

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

    let ALL_WORK_ITEMS = {
        New:  filteByStatus(workItems, WORK_ITEM_STATUS["New"]),
        Active: filteByStatus(workItems, WORK_ITEM_STATUS["Active"]),
        Review: filteByStatus(workItems, WORK_ITEM_STATUS["Review"]),
        Completed: filteByStatus(workItems, WORK_ITEM_STATUS["Completed"]),
        Block: filteByStatus(workItems, WORK_ITEM_STATUS["Block"]),
        Abandoned: filteByStatus(workItems, WORK_ITEM_STATUS["Abandoned"]),
    }

    // ORDER FOR SPRINT
    if (!_.isEmpty(activeSprint) && !_.isUndefined(activeSprintId)){

        let sprintOrder = await SprintCollection.getSprintOrder(activeSprintId, projectId);

        // if the sprint board have never been set
        if (_.isEmpty(sprintOrder["order"]["sprintBoard"])){
            sprintOrder = await setSprintOrder(sprintOrder, ALL_WORK_ITEMS, "sprintBoard");
        }else{
            // sort by the order
            ALL_WORK_ITEMS = sortByOrder(ALL_WORK_ITEMS, sprintOrder["order"]["sprintBoard"], "sprintBoard");
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
        "activeTab": "SprintBoard,Sprint",
        "tabTitle": "Sprint Board",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "projectTeams": teams,
        "sprints": sprints,
        "activeSprintId": activeSprintId,
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "WORK_ITEM_STATUS": WORK_ITEM_STATUS,
        "workItems": ALL_WORK_ITEMS,
        "currentPage": PAGES.SPRINT_BOARD,
        "userTeam": userTeamId,
        "sprintDefaultTimePeriod": SPRINT_DEFAULT_PERIOD_TIME, // Here the user can selet the time, but defualt is two weeks
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": sprintBoard["styles"],
        "scriptsPath": sprintBoard["scripts"],
        "showCompletedWorkItems": true,
    };

    res.render("sprint-board", params);
});


/**
 * METHOD: GET - Sprint planning
 */
router.get("/:id/planing/sprint", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;

    // check if there is a sprint id to look for
    let { sprintId }  = req.query;

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
    let userPreferedTeam = {};
    
    if (!sprintId){
        userPreferedTeam = projectInfo.getUserPreferedTeam();
    }

    let userTeamId = undefined;
    let sprints = [];
    let workItems = [];
    let activeSprintId = undefined;
    let activeSprint = {};

    // if there is a least one team.
    if (!_.isNull(userPreferedTeam) || sprintId){

        if (sprintId){
            activeSprint = await SprintCollection.getSprintById(projectId, sprintId).catch(err =>{
                console.error(err);
            }) || {};

        }

        userTeamId = activeSprint["teamId"] || userPreferedTeam["_id"];

        // get the active sprint for this project
        sprints = await SprintCollection.getSprintsForTeam(projectId,  userTeamId).catch(err => {
            console.error(err);
        }) || [];
 
        // check sprint
        if (!_.isEmpty(sprints) || !_.isUndefined(sprints) || !_.isNull(sprints)){
            
            let currentDate = moment(new Date()); // now

            // TODO: look a better place for this
            SprintCollection.updateSprintsStatus(projectId, currentDate);
            
            if (!sprintId){
                activeSprint = SprintCollection.getActiveSprint(sprints);
            }

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

    // ORDER FOR SPRINT
    if (!_.isEmpty(activeSprint) && !_.isUndefined(activeSprintId)){
        let sprintOrder = await SprintCollection.getSprintOrder(activeSprintId, projectId);
       
        // if the sprint board have never been set
        if (_.isEmpty(sprintOrder["order"]["sprintPlaning"]["index"])){
            sprintOrder = await setSprintOrder(sprintOrder, workItems, "sprintPlaning", true);
        }else{
            // sort by the order
            workItems = sortByOrder(workItems, sprintOrder["order"]["sprintPlaning"]["index"], "sprintPlaning");
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
        "activeSprintId": activeSprintId || "",
        "addUserModal": true,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems,
        "currentPage": PAGES.SPRINT,
        "userTeam": userTeamId,
        "sprintDefaultTimePeriod": SPRINT_DEFAULT_PERIOD_TIME, // Here the user can selet the time, but defualt is two weeks
        "priorityPoints":PRIORITY_POINTS,
        "stylesPath": sprintPath["styles"],
        "scriptsPath": sprintPath["scripts"],
        "showCompletedWorkItems": true,
    };

    res.render("planing-sprint", params);
});

// ======= FUNCTIONS ===========
async function setSprintOrder(sprint, workItems, location){
    let temp = [];

    // if the sprint board have never been set

    switch(location){
        case "sprintPlaning":
        case "sprintBacklog":
            let workItemsIds = workItems.map(each => {return each["_id"]});
            
            sprint["order"][location]["index"] = workItemsIds;

            await sprint.save().catch(err => {
                console.error("Error saving the order: ", err);
            });

            break;
        case "sprintBoard":
            // adding first time
            for (let status of Object.keys(workItems)){
                const workItemsIds = workItems[status].map(each => {return each["_id"]});
                temp.push({status: status, index: workItemsIds})
            }

            sprint["order"][location] = temp;

            await sprint.save().catch(err => {
                console.error("Error saving the order: ", err);
            });
            break;
        default: 
            break; 
    }

    return sprint;
}


module.exports = router;


