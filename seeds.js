//Esto es para prueba, este archivo crea ejemplos de prueba en la DB

const mongoose = require("mongoose"); //Require DB
let userCollection = require("./models/user");
let projectCollection = require("./models/projects");

// user
const users = [
    {
        _id: "601782de1fb2050e11bfbf1f",
        username: "Thegrafico",
        fullName: "Raul Pichardo"
    },
    {
        username: "Thegrafico2",
        fullName: "Alexander Avalo"
    }
];

// Projects
const projects = [
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

async function seedDB() {

    // remove projects
    await projectCollection.deleteMany({});
    // console.log("Projects Removed!");

    // remove users
    await userCollection.deleteMany({});
    // console.log("Users removed!");

    users.forEach(function (user) {
        // add the user to the database
        userCollection.create(user, function (err, userCreated){
            if (err) {console.log("Err 2: ", err); return;}
            console.log("User created with the id: ", userCreated._id);
            // add the project to the data base
            projects.forEach(function (project) {
                // console.log(userCreated._id);
                project["author"] = userCreated._id;

                projectCollection.create(project, function(err, projectCreated){
                    if (err) {console.log("Err 3: ", err); return;}
                    // console.log("Added project to user: ", projectCreated._id);
                    // userCollection.save();
                });
            });
        });
    });
}

//exportar nuestra funcion seedDB
module.exports = seedDB;
