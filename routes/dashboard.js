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
let projectUsersCollection  = require("../dbSchema/projectUsers");


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
    createProjectFormRedirect: "/",
    project_rediret: BASE_ROUTE
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
  projectName = req.body.projectName;
  projectDescription = req.body.projectDescription;

  // validate params 
  if (projectParamsAreValid(projectName, projectDescription)) {
    console.error("Invalid params");
    // TODO: let the user know there was an error
    res.redirect("/");
    return;
  }
  // console.log("Form Paramenter are valid!");

  let newProject = {
    "title": projectName,
    "description": projectDescription,
    "author": userId
  };

  // Insert into the database
  projectCollection.create(newProject, function (err, projectCreated) {
    if (err) {
      console.error("Error creating the project: ", err);
      return res.redirect("/")
    };
    // console.log("Project created: ", projectCreated);
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
    let response = await projectUsersCollection.find({userId: userId}).catch(err => {
      console.error("Error getting the projects for the user: ", err);
    });
   
    if (!response || response.length == 0) {
      rejected("Response is empty, cannot get the project for the user");
      return;
    }

    // get all project id
    const projectsId = response.map( e => e.projectId);

    let allProjects = await projectCollection.find({_id: {$in: projectsId}}).catch(err => console.error("Error getting the projects: ", err));

    resolve(allProjects);
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