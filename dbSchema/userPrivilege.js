/**
 * DB modal to store user privilege
*/

// import DB
const mongoose                  = require("mongoose");
const moment                    = require("moment");
const _                         = require("lodash");

const {
    USER_PRIVILEGES
} = require("./Constanst");

const ObjectId = mongoose.Schema.Types.ObjectId;

let userPrivilege = new mongoose.Schema({

    userId: {
        type: ObjectId,
        ref: "User",
        index: true
    },
    projectId: {
        type: ObjectId,
        ref: "User",
        index: true
    },
    privilege: {
        type: String,
        enum: Object.values(USER_PRIVILEGES),
        required: true, 
    },
}, {timestamps: true});

// make the userId, ProjectId unique
userPrivilege.index({ userId: 1, projectId: 1 }, { unique: true });

/**
 * remove all privilege for a project
 * @param {String} projectId - id of the project
 * @returns {Promise}
 */
 userPrivilege.statics.removeProjectPrivilege = async function(projectId) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        let err_msg = null;
        if (_.isUndefined(projectId) || _.isNull(projectId)){
            err_msg = 'Invalid project id received.';
            return reject(err_msg);
        }

        // ============= REMOVE PROJECT PRIVILEGES ==============
        await father.deleteMany({ projectId: projectId}).catch(err =>{
            err_msg = err;
        });
        
        if (err_msg){
            return reject(err_msg);        
        }

        return resolve(true);
    });
};

module.exports = mongoose.model("UserPrivilege", userPrivilege);
