/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express               = require("express");
const _                     = require("lodash");
const validator             = require("validator");
const STATUS                = require('../dbSchema/Constanst').projectStatus;
const moment                = require('moment');
const projectCollection     = require("../dbSchema/projects");
const userCollection        = require("../dbSchema/user");
const middleware            = require("../middleware/auth");
let router                  = express.Router();
const { statisticsPath }    = require("../middleware/includes");

const {performance} = require('perf_hooks');

const {
    UNASSIGNED,
    PAGES,
    UNASSIGNED_USER,
    WORK_ITEM_STATUS_COLORS,
    WORK_ITEM_STATUS,
    PRIORITY_POINTS,
    getNumberOfElements,
} = require('../dbSchema/Constanst');
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id", middleware.isUserInProject, async function (req, res) {
    console.log("GET START - Staticstics");

    let start = performance.now();
 
    let projectId = req.params.id;

    const project = req.currentProject;

    // getting users from project
    let users = await project.getUsers().catch(err => console.log(err)) || [];
    
    // getting the teams
    let teams = [...project.teams];

    // getting data for charts
    const workItems = await project.getWorkItems().catch(err => {
        console.error("Error getting project work items: ", err);
    }) || [];

    let pieData = {
        "New": getNumberOfElements(workItems, WORK_ITEM_STATUS["New"]),
        "Active": getNumberOfElements(workItems, WORK_ITEM_STATUS["Active"]),
        "Review": getNumberOfElements(workItems, WORK_ITEM_STATUS["Review"]),
        "Completed": getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"]),
        "Block": getNumberOfElements(workItems, WORK_ITEM_STATUS["Block"]),
    }

    // adding defaults
    users.unshift(UNASSIGNED_USER);
    teams.unshift(UNASSIGNED);

    // populating params
    let params = {
        "title": (project["title"] + " - Statistics"),
        "project": project,
        "projectId": projectId,
        "projectStatus": STATUS,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "priorityPoints":PRIORITY_POINTS,
        "creationDate": formatDate(project["createdAt"]),
        "currentSprint": "Not sprint found",
        "activeTab": "Statistics",
        "tabTitle": "Statistics",
        "currentPage": PAGES.STATISTICS,
        "assignedUsers": users,
        "projectTeams": teams,
        "sprints": [],
        "addUserModal": true,
        "stylesPath": statisticsPath["styles"],
        "scriptsPath": statisticsPath["scripts"],
        "pieData": pieData,
    };

    params["projectOwner"] = await getProjectOwnerNameById(project["author"]);
    params["numberOfMemberText"] = await getNumberOfUsers(project.users);
    params["numberOfMember"] = project.users.length;


       
    let end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
    console.log("GET END - Staticstics");

    res.render("statistics", params);
});


/**
 * METHOD: POST - send a project invite to an user 
 * // TODO: verify if the person adding another user is the scrum master or product owner
 */
router.post("/:id/update", middleware.isUserInProject, async function (req, res) {
    
    // get the values that can change
    const {status, description} = req.body;
    const projectId = req.params.id;
    
    if (STATUS.includes(status)){
        let response = await projectCollection.findByIdAndUpdate(projectId, {"status": status}, {"useFindAndModify":false}).catch(err => console.log("Error updating the status: ", err));

        if (_.isUndefined(response) || _.isNull(response)){
            return res.sendStatus(400);
        }
    }

    res.sendStatus(200);
});


/**
 * Change the mongodb date format to a more human readeble date format
 * @param {Date} mongoDate - mongodb date format
 */
function formatDate(mongoDate) {
    return moment(mongoDate, "YYYYMMDD").fromNow();
}

/**
 * get the name of the owner of the project
 * @param {String} userId - id of the user
 */
async function getProjectOwnerNameById(authorId) {
    const defaultOwner = "Batman";

    if (_.isUndefined(authorId)) return defaultOwner;

    let owner = await userCollection.findById(authorId).catch(err => {
        console.error("Error getting the user info: ", err)
    });

    if (_.isUndefined(owner)) return defaultOwner;

    return owner["fullName"];
}

/**
 * Return the id of the user by email
 * @param {String} email - email of the user
 * @return {Promise} id of the user
 */
function getUserIdByEmail(email) {
    return new Promise(async function (resolve, rejected) {

        let error = undefined;

        const userInfo = await userCollection.findOne({
            email: email
        }).catch(err => error = err);

        if (_.isUndefined(userInfo)) {
            return rejected(error);
        }

        if (userInfo == null) {
            return rejected("This user does not exists")
        }

        return resolve(userInfo._id);
    });
}

/**
 * get member information - # of users, user of the month
 * @param {Array} users - id of the project 
 */
async function getNumberOfUsers(users) {
    
    numberOfMember = users.length;
    return (numberOfMember > 1 ? `${numberOfMember} Members` : `One man army`);
}

module.exports = router;