/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
 */

// ============= CONST AND DEPENDENCIES =============
const express               = require("express");
const valid                 = require("validator");
const _                     = require("lodash");
let projectCollection       = require("../dbSchema/projects");
const { dashboardPath }     = require("../middleware/includes");


let router = express.Router();

// JUST FOR TESTING
const NUM_OF_PROJECT_PER_ROW = 3;
const BASE_ROUTE = 'dashboard';
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 * https://localhost:3000/dashboard
 */
router.get("/", async function (req, res) {

  let params = {
    title: "Dashboard",
    projectId: undefined,
    assignedUsers: undefined,
    teamWorkItem: undefined,
    addUserModal: undefined,
    createProjectFormRedirect: "/",
    project_rediret: BASE_ROUTE,
    stylesPath: dashboardPath["styles"],
    scriptsPath: dashboardPath["scripts"],
  };

  let projects = await getProjectsForUser(req.user._id).catch(err => {console.error(err)});

  // set it to an empty array in case is undefine or empty
  if (_.isUndefined(projects) || _.isEmpty(projects)) {
    projects = [];
  }

  /**
   * Add the project to the frond-end
   * Divide the project in chunk, so is easy to mantain in the user-site
   */
  params["projects"] = _.chunk(projects, NUM_OF_PROJECT_PER_ROW);
  // console.log(params["projects"]);

  res.render("dashboard", params);
});


/**
 * METHOD: POST - Create a new project
 * https://localhost:3000/dashboard
 * // TODO: validate project data
 */
router.post("/", function (req, res) {
  
  // get data from the form
  let projectName = req.body.projectName;
  let projectDescription = req.body.projectDescription;

  // validate params 
  if (projectParamsAreValid(projectName, projectDescription)) {
    req.flash("error", "Sorry, There was an error with the name or the description. Please try again.");
    res.redirect("/");
    return;
  }

  const newProject = {
    "title": projectName,
    "description": projectDescription,
    "author": req.user._id,
    "users": [req.user._id],
  };

  // Insert into the database
  projectCollection.create(newProject, function (err, projectCreated) {
    if (err) {
      // TODO: Log this into a TXT
      console.error("Error creating the project: ", err);
      req.flash("error", "Sorry, There was an error creating the Project. Try later or contact support.");
      res.redirect("/");
      return
    };
    res.redirect("/");
  });
});


/**
 * Get all projects the user is
 * @param {*} userId - id of the user
 */
function getProjectsForUser(userId) {
  return new Promise(async function (resolve, rejected) {
    
    // find all projects user is
    let userProjects = await projectCollection.find({users: userId}).catch(err => {
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