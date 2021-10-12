/**
 * DB modal to store all projects for a user
 */

// import DB
const userCollection            = require("./user");
const projectStatus             = require("./Constanst").projectStatus;
const workItemCollection        = require("./workItem");
const UserPrivilegeCollection   = require("./userPrivilege");
const _                         = require("lodash");
const mongoose                  = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

const { UNASSIGNED } = require('./Constanst');

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
    teams: [{
        name: {type: String, required:true, unique: true}, 
        users: [{type: ObjectId, ref: "User"}],
    }],

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
        usersArr.push({name: userInfo.fullName, id: userId, email: userInfo.email});
    }

    return usersArr;
};

/**
 * get team information by id
 * @returns {Object} - get object 
 */
projectSchema.methods.getTeam = function(teamId) {

    if (_.isUndefined(teamId) || _.isNull(teamId)){
        return {};
    }

    let teams = this.teams;
    
    let desiredTeam = teams.filter( each => {
        return each["_id"].toString() === teamId.toString();
    });

    return desiredTeam[0];
};

/**
 * Get all users from a project with the user information
 * @returns {Boolean} - array of object  -> [{name, id}]
 */
projectSchema.methods.isUserTheOwner = function(userId) {

    return this.author == userId;
};


/**
 * Get all users from a project with the user information
 * @returns {Array} - array of object  -> [{name, id}]
 */
 projectSchema.methods.getUsersWithPrivilege = async function() {

    // modal to get the user info ==> [{name, id}]
    let usersArr = [];

    const projectId = this["_id"];

    // get all users that belong to this project
    const all_users = this.users || [];
    
    // get basic info as the name and id -- Later we could get more info
    for(let i = 0; i < all_users.length; ++i){
        
        // get the current userId
        const userId = all_users[i];
        
        // get the info of that userId
        const userInfo = await userCollection.getUserWithPrivilege(projectId, userId).catch(err => console.log(err));
        
        // sky only if there is not info of the user
        if (!userInfo) continue
        
        // add that user to the array
        usersArr.push({name: userInfo.fullName, id: userId, email: userInfo.email, privilege: userInfo.privilege});
    }

    return usersArr;
};

/**
 * Get all work items from the project 
 * @returns {Array} - array of object  -> []
 */
projectSchema.methods.getWorkItems = async function(toObject=false) {
    
    let workItems = undefined;
    if (toObject){
        workItems = await workItemCollection
        .find({"projectId": this._id})
        .lean()
        .catch(err => {
            console.error("Error getting work items: ", err);
        }) || [];
    }else{
        workItems = await workItemCollection
        .find({"projectId": this._id})
        .catch(err => {
            console.error("Error getting work items: ", err);
        }) || [];
    }
    
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
 * @param {String} userId-> id of the user
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
 * Verify team is in project
 * @param {String} teamId-> Id of the team
 * @returns {Boolean} True if the team is in the project
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
 * Verify if work item is in project
 * @param {String} workItemId -> Id of the work item
 * @returns {Boolean} True if the work item is in the project
 */
projectSchema.methods.isWorkItemInProject = async function(workItemId) {

    // if empty and not string
    if (_.isEmpty(workItemId) || !_.isString(workItemId)){
        console.error("Work item is either empty or is not a String");
        return false;
    }

    let workItem = await workItemCollection.findOne({projectId: this._id, _id: workItemId}).catch(err => {
        console.error(err);
    });

    // return if work item was found
    return (_.isUndefined(workItem) || _.isNull(workItem)) ? false: true;

};


/**
 * Get the name of the user
 * @param {String} userId- > Id of the team
 * @returns {Object} User Information
 */
projectSchema.methods.getUser = async function(userId) {

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


/**
 * get all users for the team
 * @param {String} teamId - id of the team to add the user
 * @param {Boolean} getUsersNotInTeam - if true, get all users not in the team
 * @returns 
 */
projectSchema.methods.getUsersForTeam = async function(teamId, getUsersNotInTeam=false) {

    if (!this.isTeamInProject(teamId)){
        return null;
    }

    // getting team    
    let team = this.teams.filter( each => {
        return each._id == teamId;
    })[0];

    // verify is there is users in the team
    if (_.isUndefined(team)){ return [];}

    // getting the users in the team
    let usersInfo = [];

    if (getUsersNotInTeam){

        usersInfo = await userCollection.find({"_id": {$nin: team.users}}).catch(err => {
            console.error(err);
        }) || [];
    }else{
        usersInfo = await userCollection.find({"_id": {$in: team.users}}).catch(err => {
            console.error(err);
        }) || [];
    }
    

    return usersInfo;
};


/**
 * get user prefered team
 * @param {String} teamId - id of the team to add the user
 * @returns {Object} 
 */
 projectSchema.methods.getUserPreferedTeam = function() {

    if (_.isEmpty(this.teams)){
        return UNASSIGNED;
    }

    // TODO: How do we know this is the prefered team for user
    return this.teams[0];
};


/**
 * Remove a user from project
 * @param {String} userId - id of the user
 * @returns {Promise}
*/
projectSchema.methods.removeUser = async function(userId) {
    
    const father = this;
    const projectId = this["_id"];
    return new Promise( async function (resolve, reject){

        if (!father.isUserInProject(userId)){
            return reject({msg: "User is not in project", userId: null});
        }

        let response = {userId: null};

        // getting work items since user information is stored here
        let err_msg = null;
        const wasUpdatedWorkItems = await workItemCollection.updateMany( 
            { projectId: projectId, "assignedUser.id": ObjectId(userId) },
            {$set: {"assignedUser.name": UNASSIGNED.name, "assignedUser.id": null}})
            .catch(err =>{
                err_msg = err;
            }
        );

        // delete first work items
        if (err_msg || _.isUndefined(wasUpdatedWorkItems)){
            response['msg'] = "Sorry, there was a problem deleting all user information from the work items.";
            return reject(response);
        }
        
        // remove the user
        father.users.pull(userId);

        father.save().then( async (doc) => {

            await UserPrivilegeCollection.deleteOne({
                projectId: projectId,
                userId: userId
            }).catch(err => {
                console.error("Error removing user from privilege: ", err);
            });

            return resolve({msg: "User was removed successfully!", userId: userId});
        }).catch( err =>{
            response["msg"] = "Sorry, There was an error removing the user from project. Please try later"
            return reject( response );
        });

    });
};

/**
 * Remove users from project
 * @param {Array} userIds - id of all users
 * @returns {Promise}
*/
projectSchema.methods.removeUsers = async function(userIds) {
    
    const father = this;
    const projectId = this["_id"];
    return new Promise( async function (resolve, reject){

        let response = {userIds: userIds};

        if (_.isEmpty(userIds) || !_.isArray(userIds)){
            response['msg']  = "Invalid users were received";
            return reject(response);
        }

        // all Ids must be in the project
        if ( userIds.some( each => !father.isUserInProject(each)) ){
            response["msg"] = "Some of the users received are not part of the project.";
            return reject(response);
        }

        // getting work items since user information is stored here
        let err_msg = null;
        const wasUpdatedWorkItems = await workItemCollection.updateMany( 
            { projectId: projectId, "assignedUser.id":  { $in: userIds } },
            {$set: {"assignedUser.name": UNASSIGNED.name, "assignedUser.id": null}})
            .catch(err =>{
                console.error(err);
                err_msg = err;
            }
        );

        // delete first work items
        if (err_msg || _.isUndefined(wasUpdatedWorkItems)){
            response['msg'] = "Sorry, there was a problem deleting all user information from the work items.";
            return reject(response);
        }
        
        // remove the user
        for (let i = 0; i < userIds.length; i++) {
            father.users.pull(userIds[i]);
        }

        father.save().then(async (doc) => {

            await UserPrivilegeCollection.deleteMany({
                projectId: projectId,
                userId: {$in: userIds}
            }).catch(err => {
                console.error("Error removing user from privilege: ", err);
            });

            return resolve({msg: "Users were removed successfully!", userIds: userIds});
        }).catch( err =>{
            console.error(err);
            response["msg"] = "Sorry, There was an error removing the users from project. Please try later"
            return reject( response );
        });

    });
};



/**
 * Remove team from project
 * @param {String} teamId - team id
 * @returns {Promise}
*/
projectSchema.methods.removeTeam = async function(teamId) {
    
    const father = this;
    return new Promise( async function (resolve, reject){

        if (!father.isTeamInProject(teamId)){
            return reject({msg: "Team is not in project", teamId: null});
        }

        let response = {teamId: null};

        // removing team from work items
        let err_msg = null;
        const wasUpdatedWorkItems = await workItemCollection
        .updateMany( 
            { projectId: father._id, teamId: ObjectId(teamId) },
            {$set: {teamId: null}}
        ).catch(err => {
            err_msg = err;
        });

        // delete first work items
        if (err_msg || _.isUndefined(wasUpdatedWorkItems)){
            response['msg'] = "Sorry, there was a problem removing the team from the work items.";
            return reject(response);
        }

        // removing the team from the project
        father.teams.pull({ _id: teamId});

        father.save().then( (doc) => {
            return resolve({msg: "Team was removed successfully!", teamId: teamId});
        }).catch( err =>{
            response["msg"] = "Sorry, There was an error removing the team from project. Please try later."
            return reject( response );
        });

    });
};

/**
 * Remove teams from project
 * @param {String} teamsId - id of the teams
 * @returns {Promise}
*/
projectSchema.methods.removeTeams = async function(teamsId) {
    
    const father = this;
    return new Promise( async function (resolve, reject){

        for (let teamId of teamsId){

            // check every team is belongs to this project
            if (!father.isTeamInProject(teamId)){
                return reject({msg: "There is a team that does not belong to this project", teamsId: teamsId});
            }
        }

        let response = {teamsId: teamsId};

        // removing team from work items
        let err_msg = null;
        const wasUpdatedWorkItems = await workItemCollection
        .updateMany( 
            { projectId: father._id, teamId: {$in: teamsId} },
            {$set: {teamId: null}}
        ).catch(err => {
            console.error("Error removing team from work item: ", err);
            err_msg = err;
        });

        // delete first work items
        if (err_msg || _.isUndefined(wasUpdatedWorkItems)){
            response['msg'] = "Sorry, there was a problem removing the team from the work items.";
            return reject(response);
        }

        // removing the team from the project
        for (let teamId  of teamsId){
            father.teams.pull(teamId);
        }

        father.save().then( (doc) => {
            response['msg'] = (teamsId.length > 1) ? "Teams were removed successfully!" : "Team was removed successfully";
            return resolve(response);
        }).catch( err =>{
            console.error("Error saving the changes: ", err);
            response["msg"] = "Sorry, There was an error removing the team from project. Please try later."
            return reject( response );
        });

    });
};

module.exports = mongoose.model("Projects", projectSchema);