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
const SprintCollection       = require("../dbSchema/sprint");
const userCollection        = require("../dbSchema/user");
const middleware            = require("../middleware/auth");
let router                  = express.Router();
const { statisticsPath }    = require("../middleware/includes");

const {
    UNASSIGNED,
    PAGES,
    UNASSIGNED_SPRINT,
    WORK_ITEM_STATUS_COLORS,
    WORK_ITEM_ICONS,
    PRIORITY_POINTS,
} = require('../dbSchema/Constanst');
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // getting project
    let projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        req.flash("error", "Cannot the project information.");
        return res.redirect('/');
    }

    // getting users from project
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];
    
    // getting the teams
    let teams = [...projectInfo.teams];

    // adding defaults
    users.unshift(UNASSIGNED);
    teams.unshift(UNASSIGNED);

    // populating params
    let params = {
        "title": projectInfo["title"],
        "project": projectInfo,
        "projectId": projectId,
        "projectStatus": STATUS,
        "statusWorkItem": WORK_ITEM_STATUS_COLORS,
        "workItemType": WORK_ITEM_ICONS,
        "priorityPoints":PRIORITY_POINTS,
        "creationDate": formatDate(projectInfo["createdAt"]),
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
    };

    params["projectOwner"] = await getProjectOwnerNameById(projectInfo["author"]);
    params["numberOfMemberText"] = await getNumberOfUsers(projectInfo.users);
    params["numberOfMember"] = projectInfo.users.length;


    res.render("statistics", params);
});

/**
 * METHOD: POST - send a project invite to an user 
 * // TODO: verify if the person adding another user is the scrum master or product owner
 */
router.post("/:id/addmember", middleware.isUserInProject, async function (req, res) {

    const { userEmail } = req.body;

    // validate email
    if (!validator.isEmail(userEmail)) return res.redirect("back");

    const projectId = req.params.id;

    let userId = await getUserIdByEmail(userEmail).catch(err => {
        console.error(err)
    });

    if (_.isUndefined(userId) || _.isNull(userId)) {
        // TODO: add flash message 
        return res.redirect("back");
    }

    // TODO: Verify if working
    const currentProject = await projectCollection.findById(projectId).catch(err=> console.error("Error getting the project to add the user: ", err));
    
    if (_.isUndefined(currentProject) || _.isNull(currentProject)) {
        // TODO: add flash message to the user
        res.redirect("back");
    }

    // if the user does not exists, add it
    if (!currentProject.users.includes(userId)){
        await currentProject.users.push(userId);
        await currentProject.save();
        console.log("User added to the project");
    }else{
        console.log("User already exists");
    }
    res.redirect("back");
});

/**
 * METHOD: POST - send a project invite to an user 
 * // TODO: verify if the person adding another user is the scrum master or product owner
 */
router.post("/:id/removemember", middleware.isUserInProject, async function (req, res) {

    const { emailToRemove } = req.body;

    // validate email
    // TODO: add flash message to the user
    if (!validator.isEmail(emailToRemove)) return res.redirect("back");

    const projectId = req.params.id;

    // TODO: find userid by email. then add the user to the new project
    let userId = await getUserIdByEmail(emailToRemove).catch(err => {
        console.error(err)
    })

    if (_.isUndefined(userId) || userId == null) {
        // TODO: add flash message 
        return res.redirect("back");
    }

    const currentProject = await projectCollection.findById(projectId).catch(err=> console.error("Error getting the project to remove the user: ", err));

    if (_.isUndefined(currentProject) || _.isNull(currentProject)) {
        // TODO: add flash message to the user
        res.redirect("back");
    }

    if (currentProject.users.includes(userId)){
        await currentProject.users.pull({_id: userId});
        await currentProject.save();
        console.log("user removed");
    }else{
        console.log("Cannot remove a user that does not exists");
    }

    res.redirect("back");
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