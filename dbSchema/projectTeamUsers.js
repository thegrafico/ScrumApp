/**
 * DB modal to store teams for a project
*/

// import DB
const mongoose          = require("mongoose");
const userCollection    = require('./user');

const ObjectId = mongoose.Schema.ObjectId;

let projectTeamUsersSchema = new mongoose.Schema({
    TeamId: {type: ObjectId, ref: "projectTeam"},
    UserId: {type: ObjectId, ref: "User"},
}, {timestamps: true});

// set both columns to be unique ids? 
projectUserSchema.index({ "teamName": 1, "projectId": 1}, { "unique": true });

module.exports = mongoose.model("projectTeamUsers", projectTeamUsersSchema);
