/**
 * MAIN page for the creating and manipulation of the projects
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
*/


// ============= CONST AND DEPENDENCIES =============
const express = require("express");
const valid = require("validator");
let projectCollection = require("../models/projects");

let router = express.Router();
// JUST FOR TESTING
const userId = "601782de1fb2050e11bfbf1f";
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/", async function (req, res) {
  let params = { title: "Projects", createProjectFormRedirect: "/" };

  // get the projects
  let projects = await projectCollection.find({author: userId}).exec();

  // add projects to the param so is visible in the from-site
  params["projects"] = projects;

  res.render("projects", params);
});


/**
 * METHOD: POST - Create a new project
 */
router.post("/", function (req, res) {
  // get data from the form
  projectName = req.body.projectName;
  projectDescription = req.body.projectDescription;

  // validate params 
  if (projectParamsAreValid(projectName, projectDescription)) {
    // TODO: let the user know there was an error
    res.redirect("/");
    return;
  }
  // console.log("Form Paramenter are valid!");

  let newProject = {"title": projectName, "description": projectDescription, "author": userId};

  // Insert into the database
  projectCollection.create(newProject, function (err){
    if (err) {console.log("Error creating the project: ", err); return res.redirect("/")};
    // console.log("Project created: ", projectCreated);
    res.redirect("/");
  });
});

/**
 * Validate if the param sent by the form are valid
 * @param {String} name - title of the project
 * @param {String} desc - description of the project 
 */
function projectParamsAreValid(name, desc){
  return (valid.isEmpty(name) || !valid.isAlphanumeric(name) || name.length > 50 || valid.isEmpty(desc) || desc.length > 500);
}

module.exports = router;
