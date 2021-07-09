/**
 * DB modal to store all projects for a user
 */

// import DB
const userCollection        = require("./user");
const projectStatus         = require("./Constanst").projectStatus;
const workItemCollection    = require("./workItem");
const _                     = require("lodash");
const mongoose              = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

let projectSchema = new mongoose.Schema({
    author: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    title: {type: String, required: true, trim: true},
    description: {type: String, trim: true},
    status: {
        type: String,
        enum: projectStatus,
        default: "New"
    },
    users: [{type: ObjectId, ref: "User"}],
    teams: [{name: String, users: [{type: ObjectId, ref: "User"}]}],
    sprints: [{type: ObjectId, ref: "Sprint"}],
}, {
    timestamps: true
});

/**
 * Get all users from a project with the user information
 * @returns {Array} - array of object  -> [{name, id}]
 */
 projectSchema.methods.getUsers = async function() {

    // modal to get the user info ==> [{name, id}]
    let usersArr = [];

    // get all users that belong to this project
    const all_users = this.users || [];
    
    // get basic info as the name and id -- Later we could get more info
    for(let i = 0; i < all_users.length; ++i){
        
        // get the current userId
        const userId = all_users[i];
        
        // get the info of that userId
        const userInfo = await userCollection.findById(userId).catch(err => console.log(err));
        
        // sky only if there is not info of the user
        if (!userInfo) continue
        
        // add that user to the array
        usersArr.push({name: userInfo.fullName, id: userId});
    }

    return usersArr;
};

/**
 * Get all work items from the project 
 * @returns {Array} - array of object  -> []
 */
 projectSchema.methods.getWorkItems = async function() {

    const workItems = await workItemCollection.find({"projectId": this._id})
        .catch(err => console.error("Error getting work items: ", err)) || [];
    
    // TODO: verify if workItems has something
    return workItems;
};

/**
 * Get all work items from the project 
 * @param {String} -> workItemId
 * @returns {Array} - array of object  -> []
 */
 projectSchema.methods.getWorkItem = async function(workItemId) {

    // Verify if the param is a string and not empty
    if (workItemId == undefined || typeof(workItemId) != typeof("")){
        console.error("Param is undefine");
        return [];
    }

    const workItem = await workItemCollection
        .findOne({"projectId": this._id, "_id": workItemId})
        .catch(err => console.error("Error getting work items: ", err)) || [];
    
    // TODO: verify if workItems has something
    return workItem;
};

/**
 * Verify user is in project
 * @param {String} userId-> workItemId
 * @returns {Boolean} True if the user is in the project
 */
 projectSchema.methods.isUserInProject = function(userId) {

    if (_.isEmpty(userId) || !_.isString(userId)){
        console.error("Parameter is either empty or is not a String");
        return false;
    }

    return this.users.includes(userId);
};

/**
 * Verify user is in project
 * @param {String} teamId-> Id of the team
 * @returns {Boolean} True if the user is in the project
 */
 projectSchema.methods.isTeamInProject = function(teamId) {

    // if empty and not string
    if (_.isEmpty(teamId) || !_.isString(teamId)){
        console.error("teamId is either empty or is not a String");
        return false;
    }

    for (const team of this.teams){
        
        if (team._id == teamId){
            return true;
        }
    }

    return false;
};

/**
 * Get the name of the user
 * @param {String} userId- > Id of the team
 * @returns {Object} User Information
 */
 projectSchema.methods.getUserName = async function(userId) {

    // if empty and not string
    if (_.isEmpty(userId) || !_.isString(userId)){
        console.error("UserId is either empty or is not a String");
        return false;
    }
    const user = await userCollection.findById(userId).catch(err => {
        console.error("Error getting the user information: ", err);
    });

    return user;
};

/**
 * Add an user to the team if the user is not in the team. 
 * @param {String} userId - id of the user to add to the team
 * @param {String} teamId - id of the team to add the user
 * @returns 
 */
 projectSchema.methods.addUserToTeam = async function(userId, teamId) {

    if (!this.isUserInProject(userId) || !this.isTeamInProject(teamId)){
        return false;
    }

    // getting team
    let team = null;
    for (team of this.teams){
        
        if (team._id == teamId){
            break;
        }
    }

    // if the user is in team users
    if (team.users.includes(userId)){
        console.error("Cannot find user");
        return false;
    }

    team.users.push(userId);

    await this.save().catch(err => {
        console.error(err);
    });

    return true;
};

module.exports = mongoose.model("Projects", projectSchema);