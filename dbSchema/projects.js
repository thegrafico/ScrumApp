/**
 * DB modal to store all projects for a user
 */

// import DB
const userCollection    = require("./user");
const projectStatus     = require("./Constanst").projectStatus;
const mongoose          = require("mongoose");

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
    teams: [{name: String, users: [{type: ObjectId, ref: "User"}]}]
}, {
    timestamps: true
});

/**
 * Get all users from a project with the user information
 * @param {String} projectId - id of the project
 * @returns {Array} - array of object  -> [{name, id}]
 */
projectSchema.methods.getUsers = async () => {
    
    // modal to get the user info ==> [{name, id}]
    let usersArr = [];

    // get all users that belong to this project
    const all_users = this.users
    
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
}

module.exports = mongoose.model("Projects", projectSchema);