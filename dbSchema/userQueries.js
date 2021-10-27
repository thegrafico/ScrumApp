/**
 * DB modal to store all users
 */

// import DB
const mongoose  = require("mongoose");
const _         = require("lodash"); 

const ObjectId = mongoose.Schema.Types.ObjectId;

// User Schema
let userQueriesSchema = new mongoose.Schema({
    user: {
        type: ObjectId, 
        ref: "User",
        required: true,
    },
    projectId: {
        type: ObjectId,
        ref: "Project",
        required: true
    },
    queries:[
        {
            name: String,
            query: [],
        }
    ],
}, {timestamps: true});

// making the user and the project unique 
userQueriesSchema.index({ user: 1, projectId: 1 }, { unique: true });


/**
 * Check if the name for the query is duplicate or not
 * @param {String} userId 
 * @param {String} name 
 */
userQueriesSchema.methods.isNameInQueries = function(name) {
    const queries = this.queries;

    for (let query of queries){
        console.log(query["name"].trim(), " = ", name.trim());
        if (query["name"].trim() == name.trim()){
            return true;
        }
    }

   return false;
}

module.exports = mongoose.model("userQueries", userQueriesSchema);