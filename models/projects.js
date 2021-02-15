/**
 * DB modal to store all projects for a user
 */

// import DB
const projectUsers = require("./projectUsers");
const mongoose = require("mongoose");
const projectStatus = require("./Constanst").projectStatus;

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

        const response = await projectUsers
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
        
        const response = await projectUsers.deleteMany({_id: projectId}).catch((err) => {
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

module.exports = mongoose.model("Projects", projectSchema);