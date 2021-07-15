/**
 * DB modal to store all users
 */

// import DB
const mongoose  = require("mongoose");
const _         = require("lodash"); 


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

// TODO: I am use bctypt, but you need your comparer function
userSchema.methods.verifyPassword = function(password) {
    return password == this.password
};

module.exports = mongoose.model("Users", userSchema);

