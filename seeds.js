//Esto es para prueba, este archivo crea ejemplos de prueba en la DB

const mongoose              = require("mongoose"); //Require DB
let userCollection          = require("./dbSchema/user");
let projectCollection       = require("./dbSchema/projects");
let sprintCollection        = require("./dbSchema/sprint");
let workItemCollection      = require("./dbSchema/workItem");
// let TestCollection          = require("./dbSchema/test");


// user
const USERS = [
  {
    _id: "601782de1fb2050e11bfbf1f",
    email: "raul@gmail.com",
    password: "123",
    fullName: "Raul Pichardo",
  },
  {
    email: "raul2@gmail.com",
    password: "123",
    fullName: "Alexander Avalo",
  },

  {
    _id: "601782de1fb2050e11bfbf1a",
    email: "raul3@gmail.com",
    password: "123",
    fullName: "Andrea Faviola",
  },
  {
    email: "raul4@gmail.com",
    password: "123",
    fullName: "Lana Nicole",
  },
];

// Projects
const PROJECTS = [
  {
    title: "Project 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non ad deserunt tempora suscipit hic necessitatibus, vero incidunt. Doloremque, facere voluptatum qui autem ratione unde et, pariatur. Necessitatibus, veniam, eos.",
  },

  {
    title: "Project 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non ad deserunt tempora suscipit hic necessitatibus, vero incidunt. Doloremque.",
  },

  {
    title: "Project 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non ad deserunt tempora suscipit hic necessitatibus, vero incidunt. Doloremque, facere voluptatum qui autem ratione unde et, pariatur.",
  },
  {
    title: "Project 1",
    status: "Active",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non ad deserunt tempora suscipit hic necessitatibus, vero incidunt. Doloremque, facere voluptatum qui autem ratione unde et, pariatur. Necessitatibus, veniam, eos.",
  },
];

const INDIVIDUAL_PROJECT = [
  {
    _id: "6027fc80a40b46138321a5e0",
    title: "Special Project",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non ad deserunt tempora suscipit hic necessitatibus, vero incidunt. Doloremque, facere voluptatum qui autem ratione unde et, pariatur. Necessitatibus, veniam, eos.",
    teams: [{name: "Team Awesome"}, {name: "Team Batman"}],
  }
];

const PROJECT_SPRINTS = [
  {
    _id: "60597543eb149246e98eb783",
    name: "Build 0.1",
    projectId: "6027fc80a40b46138321a5e0",
    task: [],
    isActive: false,
  },
  {
    name: "Build 0.2",
    projectId: "6027fc80a40b46138321a5e0",
    task: [],
    isActive: true,
  }
];

const WORK_ITEMS = [
  {
    title: "SSRS_01",
    projectId: "6027fc80a40b46138321a5e0",
    assignedUser: {name: "Raul Pichardo", id: "601782de1fb2050e11bfbf1f"},
    sprint: "60597543eb149246e98eb783",
    storyPoints: 3,
    teamId: "6065472735af4606af3adbc9",
    type: "Story",
    description: "THis is the description of the story"
  },

  {
    title: "SSRS_02",
    projectId: "6027fc80a40b46138321a5e0",
    // assignedUser: "601782de1fb2050e11bfbf1f",
    sprint: "60597543eb149246e98eb783",
    storyPoints: 5,
    teamId: "6065472735af4606af3adbc9",
    type: "Bug",
    description: "THis is the description of the story"
  },
];

/**
 * Create sprint for a project
 */
async function createProjectSprint(){
  for (let index = 0; index < PROJECT_SPRINTS.length; index++) {
    await sprintCollection.create(PROJECT_SPRINTS[index]).catch(err => { console.log("Error Creating the sprint for the project: ", err); throw err});
  }
}


/**
 * Add user to the database
 */
async function addUsersToDB(){
  
  usersIds = [];

  for (let index = 0; index < USERS.length; index++) {
    const userInfo = await userCollection.create(USERS[index]).catch(err => { console.log(`Error adding the user [${USERS[index]["email"]}]: `, err); throw err});
    usersIds.push(userInfo._id);
  }
  console.log("users added: ", usersIds.length);

  return usersIds;
}


/**
 * Create project for an user 
 * @param {String} user_id - id of the user 
 */
async function createProjectForUser(user_id, defaultProjects = PROJECTS){
  let projectIds = []
  
  for (let index = 0; index < defaultProjects.length; index++) {
    let newProject = defaultProjects[index];
    
    // add the author of the project
    newProject["author"] = user_id;
    newProject["users"] = [user_id, "601782de1fb2050e11bfbf1a"]; 
    const projectInfo = await projectCollection.create(newProject).catch(err => { console.error("Error adding the Project: ", err); throw err});
    
    projectIds.push(projectInfo._id);
  }
  console.log(`Number of Projects create ${projectIds.length} for user: ${user_id}`);

  return projectIds;
}


async function createWorkItem(){
  for (let index = 0; index < WORK_ITEMS.length; index++) {
    await workItemCollection.create(WORK_ITEMS[index]).catch(err => { console.error("Error adding work item: ", err); throw err});
  }
}

// /**
//  * Create sprint for a project
//  */
//  async function createTest(){
  
//   let testData = {
//     name: "Pedro"
//   };

//   await TestCollection.create(testData).catch(err => { 
//     console.log("Error Creating the sprint for the project: ", err); 
//   }).catch(err => {
//     console.error("Error Creating the test: ", err);
//   });
// }


async function seedDB() {
  // ==================== CLEAN THE DB ==================== 
  // createTest();
  console.log("===================");
  // remove work items
  let result = await workItemCollection.deleteMany({});
  console.log("work Item removed!: ", result);

  workItemCollection.counterReset('sequence', function(err) {console.log("Counter reset")});

  // remove all sprint from a project
  result = await sprintCollection.deleteMany({});
  console.log("Sprint removed!: ", result);

  // remove projects
  result = await projectCollection.deleteMany({});
  console.log("Project removed!: ", result);

  // await projectCollection.deleteOne({_id: INDIVIDUAL_PROJECT});

  // remove users
  result = await userCollection.deleteMany({});
  console.log("Users removed!: ", result);
  console.log("===================");

  // reset counter to 0

  // ======================================================

  const usersId = await addUsersToDB();

  // // add one project with a specify id to the user: for testing
  // await createProjectForUser(usersId[0], INDIVIDUAL_PROJECT).catch(err => console.log("Error Creating project for user: ", err));
    
  // for (let i = 0; i < usersId.length; i++) {
  //   const id = usersId[i];
  //   await createProjectForUser(id);
  // }

  // // await createProjectSprint();

  // await createWorkItem();

}

// export our function
module.exports = seedDB;
