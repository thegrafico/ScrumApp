//Esto es para prueba, este archivo crea ejemplos de prueba en la DB

const mongoose              = require("mongoose"); //Require DB
let userCollection          = require("./dbSchema/user");
let projectCollection       = require("./dbSchema/projects");
let projectUsersCollection  = require("./dbSchema/projectUsers");
let projectTeamCollection   = require("./dbSchema/projectTeam");
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
  }
];

const PROJECT_TEAM = [
  {
    name: "Team Batman",
    projectId: "6027fc80a40b46138321a5e0",
    users: [],
  },
  {
    name: "Team Superman",
    projectId: "6027fc80a40b46138321a5e0",
    users: [],
  },
]

/**
 * Create the project team
 */
async function createProjectTeam(){
  for (let index = 0; index < PROJECT_TEAM.length; index++) {
    await projectTeamCollection.create(PROJECT_TEAM[index]).catch(err => { console.log("Error Creating the team for the project: ", err); throw err});
  }
}

/**
 * Add user to the database
 */
async function addUsersToDB(){
  
  usersIds = [];

  for (let index = 0; index < USERS.length; index++) {
    const userInfo = await userCollection.create(USERS[index]).catch(err => { console.log("Error adding the user: ", err); throw err});
    usersIds.push(userInfo._id);
  }
  // console.log("users added: ", usersIds.length);

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
    
    const projectInfo = await projectCollection.create(newProject).catch(err => { console.error("Error adding the user: ", err); throw err});
    
    projectIds.push(projectInfo._id);
  }

  // console.log(`Number of Projects create ${projectIds.length} for user: ${user_id}`);


  return projectIds;
}

/**
 * add an user to the project
 * @param {String} userId - id of the user
 * @param {String} projectId -id of the project
 */
async function addUserToProject(userId, projectId){
  const response = await projectUsersCollection.create({userId, projectId}).catch(err => {console.log("Error adding the user to a project: ", err);});
  return (response != null);
}

async function seedDB() {
  
  // Remove all teams
  await projectTeamCollection.deleteMany({});

  // remove projects
  await projectCollection.deleteMany({});
  // await projectCollection.deleteOne({_id: INDIVIDUAL_PROJECT});

  // remove users
  await userCollection.deleteMany({});
  // console.log("Users removed!");

  // removing the users from project
  await projectUsersCollection.deleteMany({});

  const usersId = await addUsersToDB();

  // add one project with a specify id to the user: for testing
  await createProjectForUser(usersId[0], INDIVIDUAL_PROJECT).catch(err => console.log("Error Creating project for user: ", err));
  await addUserToProject(usersId[1], INDIVIDUAL_PROJECT[0]._id);
  
  for (let i = 0; i < usersId.length; i++) {
    const id = usersId[i];
    await createProjectForUser(id);
  }

  // create team project
  await createProjectTeam();

}

// export our function
module.exports = seedDB;
