/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express                   = require("express");
const _                         = require("lodash");
const validator                 = require("validator");
const STATUS                    = require('../dbSchema/Constanst').projectStatus;
const moment                    = require('moment');
const projectCollection         = require("../dbSchema/projects");
const sprintCollection          = require("../dbSchema/sprint");
const workItemCollection        = require("../dbSchema/workItem");
const userCollection            = require("../dbSchema/user");
const middleware                = require("../middleware/auth");
let router                      = express.Router();

const {
    UNASSIGNED, 
    EMPTY_SPRINT,
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS,
    MAX_STORY_POINTS = 500,
    MAX_PRIORITY_POINTS = 5,
    capitalize
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

    // LOADING TABLE WORK ITEMS
    workItems = await workItemCollection.find().catch(err => console.error("Error getting work items: ", err)) || [];

    // populating params
    let params = {
        "project": projectInfo,
        "projectId": projectId,
        "activeTab": "Backlog,Planing",
        "tabTitle": "Backlog",
        "assignedUsers": users,
        "statusWorkItem": WORK_ITEM_STATUS,
        "teamWorkItem": teams,
        "sprints": sprints,
        "workItemType": WORK_ITEM_ICONS,
        "workItems": workItems
    };

    res.render("planing-backlog", params);
});

/**
 * METHOD: GET - show the main page for projects
 */
router.post("/:id/planing/backlog/newWorkItem", middleware.isUserInProject, async function (req, res) {

    // new work item
    let {
        title,
        userAssigned,
        workItemStatus,
        teamAssigned,
        workItemType,
        sprint,
        workItemDescription,
        storyPoints,
        priorityPoints,
        tags
    } = req.body;

    // Fixing variables 
    workItemStatus = capitalize(workItemStatus);
    workItemType = capitalize(workItemType);
    storyPoints = parseInt(storyPoints);
    priorityPoints = parseInt(priorityPoints);
    tags = tags || []; // give a default value in case undefined

    console.log("REQUEST: ", req.body, tags);

    // getting project info
    let projectInfo = await projectCollection.findOne({_id: req.params.id}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isEmpty(projectInfo) || _.isNull(projectInfo)){
        res.status(400).send("Cannot find any project for the information requested");
        return res.redirect("back");
    }

    const users = projectInfo["users"];
    const teams = projectInfo["teams"].map(element => element._id); // TODO: what would happend in case projecInfo does not have anything 
    const sprints = projectInfo["sprints"];

    // to create a new work item
    let newWorkItem = {};

    // ============ Title ==============
    if (_.isEmpty(title) || title.length < 3){
        res.status(400).send("Title cannot be empty and have to be grater than 3 chars.");
        return res.redirect("back");
    }
    
    // =========== USER ID ================
    // Verify the user is in the project 
    if (userAssigned != UNASSIGNED.id && !users.includes(userAssigned)){
        res.status(400).send("Cannot find the user assigned for this work item");
        return res.redirect("back");
    }

    if (userAssigned != UNASSIGNED.id) {
        const _user = await userCollection
            .findOne({_id: userAssigned})
            .catch(err => console.error("Cannot get the user: ", err));

        // -- 
        if (_user){
            newWorkItem["assignedUser"] = {name: _user["fullName"],'id': userAssigned};
        }else{
            console.error("User was not found when creating work item");
        }
    }
    // ================== STATUS ================

    // Status
    if (_.isEmpty(workItemStatus) || !_.isString(workItemStatus) || !Object.keys(WORK_ITEM_STATUS).includes(workItemStatus)){
        res.status(400).send("Status cannot be empty");
        return res.redirect("back");
    }

    // =============== TEAMS =============
    if (teamAssigned != UNASSIGNED.id && !teams.includes(teamAssigned)){
        res.status(400).send("Cannot find the team assigned for this work item");
        return res.redirect("back");
    }

    // add the user if not default
    // TODO: if a user was assigned to this work item, then we should add that user to the team if the user is not in the team already. 
    if (teamAssigned != UNASSIGNED.id) 
        newWorkItem["teamId"] = teamAssigned;

    //  ================= TYPE ================
    if(Object.keys(WORK_ITEM_ICONS).includes(workItemType)){
        newWorkItem["type"] = workItemType;
    }

    // =============== SPRINT ==============
    if (sprints.includes(sprint)){
        newWorkItem["sprint"] = sprint;
    }

    // ================ POINTS ===============
    if ( _.isNumber(storyPoints) && !isNaN(storyPoints) && (storyPoints >= 0  && storyPoints <= MAX_STORY_POINTS)){
        newWorkItem["storyPoints"] = storyPoints;
    }

    // ================== priority ===============
    if ( _.isNumber(priorityPoints) && !isNaN(priorityPoints) && (priorityPoints >= 0  && priorityPoints <= MAX_PRIORITY_POINTS)){
        newWorkItem["priorityPoints"] = priorityPoints;
    }

    // ============== TAGS =================
    // if there is tags available
    if (!(_.isEmpty(tags))){
        newWorkItem["tags"] = tags;
    }

    newWorkItem["title"] = title;
    newWorkItem["status"] = workItemStatus;
    newWorkItem["description"] = workItemDescription;
    newWorkItem["projectId"] = req.params.id;
    
    // TODO: Create new schema for comments
    // newWorkItem["comments"]

    newWorkItem = await workItemCollection.create(newWorkItem).catch(err => console.error("Error creating the work item: ", err));
    
    console.log("Was work item created: ", newWorkItem != undefined);
    res.redirect("back");
});


module.exports = router;