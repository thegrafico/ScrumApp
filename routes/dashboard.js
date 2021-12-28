/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express = require("express");

const {dashboardPath} = require("../middleware/includes");
let router = express.Router();

const { MAX_NUMBER_OF_FAVORITE_PROJECTS} = require("../dbSchema/Constanst");

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
        project_rediret: 'dashboard',
        stylesPath: dashboardPath["styles"],
        scriptsPath: dashboardPath["scripts"],
        numberOfFavoriteProjects: LIMIT_NUMBER_OF_FAVORITE_PROJECTS,
        maxNumberOfFavoriteProjects: MAX_NUMBER_OF_FAVORITE_PROJECTS,
    };

    res.render("dashboard", params);
});

module.exports = router;