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

    let projects = await getProjectsForUser(req.user._id).catch(err => {
        console.error(err)
    });

    // set it to an empty array in case is undefine or empty
    if (_.isUndefined(projects) || _.isEmpty(projects)) {
        projects = [];
    }

    // getting inital of the projects
    const COLORS_LIMIT = 3; //PROJECT_INITIALS_COLORS.length;
    let colorsIndex = 0;
    for (let project of projects) {

        setupProjectInitials(project, colorsIndex);

        colorsIndex++;

        if (colorsIndex >= COLORS_LIMIT){
            colorsIndex = 0;
        }
    }

    // getting user favorite projects
    let userFavoriteProjects = projects.filter(each => {
        return req.user["favoriteProjects"].includes(each["_id"].toString());
    });

    console.log(projects.length);

    // filter normal projects
    projects = projects.filter(each => {
        return !req.user["favoriteProjects"].includes(each["_id"].toString());
    });

    // Keep the favorite number of project to 3. in case there are less than 3, assign the length
    const LIMIT_NUMBER_OF_FAVORITE_PROJECTS = (userFavoriteProjects.length > MAX_NUMBER_OF_FAVORITE_PROJECTS) ? MAX_NUMBER_OF_FAVORITE_PROJECTS : userFavoriteProjects.length;


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
        projects: projects,
        userFavoriteProjects: userFavoriteProjects,
    };

    /**
     * Add the project to the frond-end
     * Divide the project in chunk, so is easy to mantain in the user-site
     */
    // params["projects"] = _.chunk(projects, NUM_OF_PROJECT_PER_ROW);
    // console.log(params["projects"]);

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