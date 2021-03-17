/**
 * DB modal to store all projects for a user
 */

// import DB
const projectUsersCollection    = require("./projectUsers");
const userCollection            = require("./user");
const projectStatus             = require("./Constanst").projectStatus;
const mongoose                  = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

let projectSchema = new mongoose.Schema({
    author: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    title: String,
    description: String,
    status: {
        type: String,
        enum: projectStatus,
        default: "New"
    },
}, {
    timestamps: true
});


/**
 * remove all users that have this project when this project is removed
 */
projectSchema.post("deleteOne", async function (currentProject) {
    
    console.log("Removing the users from the project");

    await removeUsersFromProject(currentProject._id).catch(
        (err) => {
            console.log("Failed to add the user to a project: ", err);
        }
    );
});

/**
 * After a project is created, we need to add the user to the projectUsers modal
 */
projectSchema.post("save", async function (currentProject) {
    // console.log('%s has been saved', currentProject.author);
    await addToProjectUsers(currentProject._id, currentProject.author).catch(
        (err) => {
            console.log("Failed to add the user to a project: ", err);
        }
    );
});


/**
 * Share the project ot a user
 * @param {String} projectId - id of the project ot add the user
 * @param {String} userId - id of the user to be added
 * @returns {Promise} promise with boolean
 */
function addToProjectUsers(projectId, userId) {
    return new Promise(async function (resolve, reject) {
        // new record
        const newUserInProject = {
            userId,
            projectId
        };

        const response = await projectUsersCollection
            .create(newUserInProject)
            .catch((err) => {
                console.log("Error adding the user to the project: ", err);
            });

        // if not response
        if (!response) {
            reject(false);
            return;
        }

        resolve(true);
    });
}

function removeUsersFromProject(projectId) {
    return new Promise(async function (resolve, reject) {
        
        const response = await projectUsersCollection.deleteMany({_id: projectId}).catch((err) => {
            console.log("Error removing the users from project removed: ", err);
        });

        // if not response
        if (!response) {
            reject(false);
            return;
        }
        resolve(true);
    });
}

/**
 * Get all users from a project with the user information
 * @param {String} projectId - id of the project
 * @returns {Array} - array of object  -> [{name, id}]
 */
projectSchema.statics.getUsers = async (projectId) => {
    
    // modal to get the user info ==> [{name, id}]
    let usersArr = [];

    // get all users that belong to this project
    const all_users = await projectUsersCollection.find({projectId}).catch(err => console.log(err));
    
    // get basic info as the name and id -- Later we could get more info
    for(let i = 0; i < all_users.length; ++i){
        
        // get the current userId
        const userId = all_users[i].userId;
        
        // get the info of that userId
        const userInfo = await userCollection.findById(userId).catch(err => console.log(err));
        
        // sky only if there is not info of the user
        if (!userInfo) continue
        
        // add that user to the array
        usersArr.push({name: userInfo.fullName, id: userId});
    }

    return usersArr;
}

module.exports = mongoose.model("Projects", projectSchema);