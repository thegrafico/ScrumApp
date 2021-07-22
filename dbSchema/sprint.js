/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose  = require("mongoose");
const moment    = require("moment");
const _         = require("lodash");

const {
    SPRINT_FORMAT_DATE,
    SPRINT_STATUS,
} = require("./Constanst");

const ObjectId = mongoose.Schema.ObjectId;

let sprintSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        validate: {
            validator: function (_name) {
                return _name.length > 3 && _name.length < 25; 
            },
            message: 'Sprint name length needs to be >= 3 and <= 25.'
        }
    },
    projectId: {
        type: ObjectId,
        ref: "Project"
    },
    tasks: [
        {   
            type: ObjectId,
            ref: "WorkItem"
        }
    ],
    teamId: {
        type: ObjectId,
        ref: "Projects", // teams
        required: true
    },
    startDate: {
        type: String, 
        required: true,
        validate: {
            validator: function (_startDate) {
                return moment(_startDate, SPRINT_FORMAT_DATE).isValid();
            },
            message: `Invalid date format. Format should be: ${SPRINT_FORMAT_DATE}`
        }
    },
    endDate: {
        type: String, 
        required: true,
        validate: {
            validator: function (_endDate) {
                return moment(_endDate, SPRINT_FORMAT_DATE).isValid();
            },
            message: `Invalid date format. Format should be: ${SPRINT_FORMAT_DATE}`
        }
    },
    status: {
        type: String,
        enum: Object.values(SPRINT_STATUS),
        required: true, 
    },
}, {timestamps: true});

/**
 * Get all sprints for a team
 * @param {String} teamId - id of the team.
 * @returns {Promise} - array of sprints
*/
sprintSchema.statics.getSprintsForTeam = async function(teamId) {
    
    let father = this;
    return new Promise( async function (resolve, reject){

        let response = {teamId: teamId};

        // removing team from work items
        let err_msg = null;
        const sprints = await father.find( { teamId: teamId} ).catch(err => {
            err_msg = err;
        });

        // delete first work items
        if (err_msg || _.isUndefined(sprints)){
            response['msg'] = "Sorry, Cannot find the sprint for this team";
            return reject(response);
        }

        resolve(sprints);
    });
};

/**
 * Validate if the date of the new sprint does not conflig with the previus sprint
 * @param {Array} sprints - all sprints data
 * @param {String} newSprintStartDate - start date for new sprint
 * @param {String} newSprintEndDate  - end date for new sprint
 * @returns {Boolean} True if start and end date does not conflig with any of the dates for the  previus sprints
*/
sprintSchema.statics.isValidSprintDate = function(sprints, newSprintStartDate, newSprintEndDate) {
    
    if (!_.isArray(sprints) || _.isEmpty(sprints) || _.isEmpty(newSprintStartDate) || _.isEmpty(newSprintEndDate)){
        console.error("Invalid parameters were received.");
        return false;
    }

    let momentStartDateNewSprint = moment(newSprintStartDate, SPRINT_FORMAT_DATE);
    let momentEndDateNewSprint = moment(newSprintEndDate, SPRINT_FORMAT_DATE);

    if (!momentStartDateNewSprint.isValid() || !momentEndDateNewSprint.isValid()){
        console.error("Invalid dates for the new sprint was received.");
        return false;
    }

    try {
        
        for (const sprint of sprints){
            console.log("Evaluating sprint: ", sprint);

            if (_.isUndefined(sprint)){ continue;}
    
            let sprintStartDate = moment(sprint["startDate"], SPRINT_FORMAT_DATE);
            let sprintEndDate = moment(sprint["endDate"], SPRINT_FORMAT_DATE);

            let isStartDateBetween = momentStartDateNewSprint.isBetween(sprintStartDate, sprintEndDate, undefined, "[)");
            let isEndDateBetween = momentEndDateNewSprint.isBetween(sprintStartDate, sprintEndDate, undefined, "(]");

            // check if any of the new sprint date conflig with another sprint
            if (isStartDateBetween || isEndDateBetween){
                return false
            }
        }
    } catch (error) {
        console.error(error);
        return false;
    }
    
    return true;
};


module.exports = mongoose.model("Sprint", sprintSchema);
