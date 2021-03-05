/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express               = require("express");
const _                     = require("lodash");
const validator             = require("validator");
const STATUS                = require('../models/Constanst').projectStatus;
const moment                = require('moment');
const projectCollection     = require("../models/projects");
const userCollection        = require("../models/user");
const projectUserCollection = require("../models/projectUsers");
const middleware            = require("../middleware/auth");
let router                  = express.Router();
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // verify is the project exists
    // TODO: verify if the user can access to the project
    let projectInfo = await projectCollection.findOne({
        _id: projectId
    }).catch(err => {
        console.log("Error is: ", err.reason);
    });

    // console.log("Project information: ", projectInfo);

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        // TODO: show a message to the user
        return res.redirect('/');
    }

    // populating params
    let params = {
        "project": projectInfo,
        "projectId": projectId,
        "projectStatus": STATUS,
        "creationDate": formatDate(projectInfo["createdAt"]),
        "currentSprint": "Not sprint found",
        "activeTab": "Statistics",
        "tabTitle": "Statistics",
    };
    params["projectOwner"] = await getProjectOwnerNameById(projectInfo["author"]);
    params["numberOfMember"] = await getMembersInfo(projectId);

    res.render("statistics", params);
});

/**
 * METHOD: POST - send a project invite to an user 
 * // TODO: verify if the person adding another user is the scrum master or product owner
 */
router.post("/:id/addmember", middleware.isUserInProject, async function (req, res) {

    const {
        userEmail
    } = req.body;

    // validate email
    if (!validator.isEmail(userEmail)) return res.redirect("back");

    const projectId = req.params.id;

    // TODO: find userid by email. then add the user to the new project
    let userId = await getUserIdByEmail(userEmail).catch(err => {
        console.error(err)
    })

    if (_.isUndefined(userId) || userId == null) {
        // TODO: add flash message 
        return res.redirect("back");
    }

    const newMember = {
        userId,
        projectId
    };

    const response = await projectUserCollection
        .create(newMember)
        .catch((err) => {
            console.error("Error adding the user to the project: ", err);
        });

    if (_.isUndefined(response) || _.isNull(response)) {
        // TODO: add flash message to the user
        res.redirect("back");
    }

    console.log("User added to the project");
    res.redirect("back");
});

/**
 * METHOD: POST - send a project invite to an user 
 * // TODO: verify if the person adding another user is the scrum master or product owner
 */
router.post("/:id/removemember", middleware.isUserInProject, async function (req, res) {

    const { emailToRemove
    } = req.body;

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

    const memberToRemove = {
        userId,
        projectId
    };

    const response = await projectUserCollection
        .deleteOne(memberToRemove)
        .catch((err) => {
            console.error("Error deleting the user to the project: ", err);
        });

    if (_.isUndefined(response) || _.isNull(response)) {
        // TODO: add flash message to the user
        res.redirect("back");
    }

    console.log("User removed from the project");
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
 * @param {String} projectId - id of the project 
 */
async function getMembersInfo(projectId) {
    const numberOfMember = await projectUserCollection.where({
        "projectId": projectId
    }).countDocuments();

    return (numberOfMember > 1 ? `${numberOfMember} Members` : `One man army`);
}

module.exports = router;