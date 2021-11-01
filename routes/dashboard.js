/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express = require("express");
const valid = require("validator");
const _ = require("lodash");
let projectCollection = require("../dbSchema/projects");
const {
    dashboardPath
} = require("../middleware/includes");
let router = express.Router();


const {
    PROJECT_INITIALS_COLORS,
    MAX_NUMBER_OF_FAVORITE_PROJECTS,
    setupProjectInitials,
} = require("../dbSchema/Constanst");

const BASE_ROUTE = 'dashboard';
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 * https://localhost:3000/dashboard
 */
router.get("/", async function (req, res) {

    // Keep the favorite number of project to 3. in case there are less than 3, assign the length
    const LIMIT_NUMBER_OF_FAVORITE_PROJECTS = (req.user["favoriteProjects"].length > MAX_NUMBER_OF_FAVORITE_PROJECTS) ? MAX_NUMBER_OF_FAVORITE_PROJECTS : req.user["favoriteProjects"].length;

    let params = {
        title: "Dashboard",
        projectId: undefined,
        assignedUsers: undefined,
        projectTeams: [],
        addUserModal: undefined,
        sprints: [],
        currentPage: undefined,
        createProjectFormRedirect: "/",
        project_rediret: BASE_ROUTE,
        stylesPath: dashboardPath["styles"],
        scriptsPath: dashboardPath["scripts"],
        numberOfFavoriteProjects: LIMIT_NUMBER_OF_FAVORITE_PROJECTS,
        maxNumberOfFavoriteProjects: MAX_NUMBER_OF_FAVORITE_PROJECTS,
    };

    res.render("dashboard", params);
});


/**
 * Get all projects the user is
 * @param {*} userId - id of the user
 */
function getProjectsForUser(userId) {
    return new Promise(async function (resolve, rejected) {

        // find all projects user is
        let userProjects = await projectCollection.find({
            users: userId
        }).catch(err => {
            console.error("Error getting the projects for the user: ", err);
        });

        if (!userProjects || userProjects.length == 0) {
            rejected("Response is empty, cannot get the project for the user");
            return;
        }

        resolve(userProjects);
    });

}

/**
 * Validate if the param sent by the form are valid
 * @param {String} name - title of the project
 * @param {String} desc - description of the project 
 */
function projectParamsAreValid(name, desc) {
    return (valid.isEmpty(name) || !valid.isAlphanumeric(valid.blacklist(name, ' ')) || name.length > 50 || valid.isEmpty(desc) || desc.length > 500);
}

module.exports = router;