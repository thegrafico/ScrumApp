/**
 * DB modal to store all users in a specify project
*/

// import DB
const mongoose = require("mongoose");
const userStatus = require('./Constanst').userStatus;
const userCollection = require('./user');

const ObjectId = mongoose.Schema.ObjectId;

let projectUserSchema = new mongoose.Schema({
    userId: {type: ObjectId, ref: "User"},
    projectId: {type: ObjectId, ref: "Projects"},
    status: {type: Boolean, default: true},
}, {timestamps: true});

// set both columns to be unique ids? 
projectUserSchema.index({ "userId": 1, "projectId": 1}, { "unique": true });

module.exports = mongoose.model("projectUsers", projectUserSchema);
