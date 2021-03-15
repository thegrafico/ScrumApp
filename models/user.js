/**
 * DB modal to store all users
 */

// import DB
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true, index: {unique: true}},
    password:  {type: String, required: true} 
}, {timestamps: true});

userSchema.plugin(passportLocalMongoose);

// TODO: I am use bctypt, but you need your comparer function
userSchema.methods.verifyPassword = function(password) {
    return password == this.password
};

// TODO: add middleware in order to remove all reference of user from other collections

module.exports = mongoose.model("User", userSchema);

