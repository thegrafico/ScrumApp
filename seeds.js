//Esto es para prueba, este archivo crea ejemplos de prueba en la DB

const mongoose = require("mongoose"); //Require DB
let userCollection = require("./models/user");
let projectCollection = require("./models/projects");
let projectUsers = require("./models/projectUsers");

// user
const USERS = [
  {
    _id: "601782de1fb2050e11bfbf1f",
    username: "raul@gmail.com",
    password: "123",
    fullName: "Raul Pichardo",
  },
  {
    username: "raul02210712@gmail.com",
    password: "123456",
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

// const usersInProject = [
//   {

//   },
// ];


async function addUsersToDB(){
  
  usersIds = [];

  for (let index = 0; index < USERS.length; index++) {
    const userInfo = await userCollection.create(USERS[index]).catch(err => { console.log("Error adding the user: ", err); throw err});
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
    
    const projectInfo = await projectCollection.create(newProject).catch(err => { console.error("Error adding the user: ", err); throw err});
    
    projectIds.push(projectInfo._id);
  }

  console.log(`Projects create ${projectIds.length} for user: ${user_id}`);


  return projectIds;
}

async function seedDB() {
  
  let justOne = true;

  // remove projects
  await projectCollection.deleteMany({});
  // console.log("Projects Removed!");

  // remove users
  await userCollection.deleteMany({});
  // console.log("Users removed!");

  const usersId = await addUsersToDB();
  
  for (let i = 0; i < usersId.length; i++) {
    const id = usersId[i];
    await createProjectForUser(id);
  }

  // users.forEach(function (user) {
  //   // add the user to the database
  //   userCollection.create(user, function (err, userCreated) {
  //     if (err) {
  //       console.log("Err 2: ", err);
  //       return;
  //     }
  //     console.log("User created with the id: ", userCreated._id);

  //     // add the project to the data base
  //     projects.forEach(function (project) {
  //       // console.log(userCreated._id);
  //       project["author"] = userCreated._id;

  //       // set a project id only for the first user
  //       if (userCreated._id != "601782de1fb2050e11bfbf1f" && justOne) {project["_id"] = "6027fe5d95c3fa28d5388f6f"; justOne = false; console.log("Here")}; 
  //       projectCollection.create(project, function (err, projectCreated) {
  //         if (err) {
  //           console.log("Err 3: ", err);
  //           return;
  //         }
  //         console.log("Added project to user: ", projectCreated._id);
  //         // userCollection.save();
  //       });
  //     });
  //   });
  // });
}
// db.getCollectionNames().forEach(function(x) {db[x].drop()})

//exportar nuestra funcion seedDB
module.exports = seedDB;
