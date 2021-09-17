/**
 * DB modal to store all users
 */

// import DB
const mongoose                  = require("mongoose");
const _                         = require("lodash"); 
const UserPrivilegeCollection   = require("./userPrivilege");

const {
    USER_PRIVILEGES
} = require("./Constanst");


const passportLocalMongoose = require("passport-local-mongoose");

// User Schema
let userSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true, index: {unique: true}},
    password:  {type: String, required: true},
}, {timestamps: true});

userSchema.plugin(passportLocalMongoose);

/**
 * get userid by email
 * @param {String} email - id of the team to add the user
 * @returns {String} - user id
 */
userSchema.statics.getUserByEmail = async function(email) {

    if (_.isEmpty(email) || !_.isString(email)){
        return null;
    }

    // getting user
    const userInfo = await this.findOne({
        email: email
    }).catch(err => error = err);

    if (_.isUndefined(userInfo) || _.isNull(userInfo)) {
        return undefined;
    }

    return userInfo;
};

/**
 * get user info by projectid and userId
 * @param {String} projectId - id of the team to add the user
 * @param {String} userId - user id
 * @returns {Promise}
 */
 userSchema.statics.getUserWithPrivilege = async function(projectId, userId) {

    let father = this;
    let error = undefined;
    return new Promise( async function (resolve, reject){

        if (_.isUndefined(projectId) || _.isUndefined(userId)){
            return reject("Invalid paramenters were received");
        }

        // getting user
        let userInfo = await father.findById(userId).lean().catch(err => error = err);

        // check if there was an error
        if (error){
            return reject("Error getting the user: ", error);
        } else if (_.isUndefined(userInfo) || _.isNull(userInfo)) { // check if the user was found
            return reject("User not found");
        }

        // at this point the user was found. get the privilege for the user
        let userPrivilege = await UserPrivilegeCollection.findOne(
            {projectId: projectId, userId: userId}
        ).catch(err => {
            error = err;
        });

        if (error){
            console.error("Error getting the privilege for the user");
            userInfo["privilege"] = USER_PRIVILEGES["MEMBER"]; // Default
        } else if(!userPrivilege){
            console.log("Privilege not found");

            // create the privilege into the database
            let userPrivilegeWasCreated = await UserPrivilegeCollection.create({
                userId: userId,
                projectId: projectId,
                privilege: USER_PRIVILEGES["MEMBER"]
            }).catch(err => {
                console.error("Error creating the user privilege record");
            });

            if (!userPrivilegeWasCreated){
                console.log("Error creating user privilege.");
            }
            
            userInfo["privilege"] = USER_PRIVILEGES["MEMBER"]; // Default
        }else{
            userInfo["privilege"] = userPrivilege["privilege"];
        }
        
        resolve(userInfo);
    });

};




// TODO: I am use bctypt, but you need your comparer function
userSchema.methods.verifyPassword = function(password) {
    return password == this.password
};

module.exports = mongoose.model("Users", userSchema);

