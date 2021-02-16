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
        "projectStatus": STATUS,
        "creationDate": formatDate(projectInfo["createdAt"]),
        "currentSprint": "Not sprint found"
    };
    params["projectOwner"] = await getProjectOwnerNameById(projectInfo["author"]);
    params["numberOfMember"] = await getMembersInfo(projectId);

    res.render("projectDetail", params);
});

/**
 * METHOD: POST - send a project invite to an user 
 */
router.post("/:id/addmember", middleware.isUserInProject, async function (req, res) {

    const { userEmail } = req.body;

    // validate email
    if (!validator.isEmail(userEmail)) return res.redirect("back");
 
    const projectId = req.params.id;
    
    // TODO: find userid by email. then add the user to the new project
    let response = await projectUserCollection.create({}).cat
    res.redirect("back");
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
 * get member information - # of users, user of the month
 * @param {String} projectId - id of the project 
 */
async function getMembersInfo(projectId) {
    const numberOfMember = await projectUserCollection.where({
        "projectId": projectId
    }).count();

    return (numberOfMember > 1 ? `${numberOfMember} Members` : `One man army`);
}

module.exports = router;