/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose                  = require("mongoose");
const moment                    = require("moment");
const _                         = require("lodash");
const WorkItemCollection        = require("./workItem");
const OrderSprintCollection     = require("./sprint-order");


const {
    SPRINT_FORMAT_DATE,
    SPRINT_STATUS,
    getSprintDateStatus,
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
    pointsHistory: [
        {
            date: {type: String, required: true},
            points: {type: Number, required: true},
        }
    ],
    initialPoints: {type: Number, default: 0}
}, {timestamps: true});

/**
 * Get all sprints for a team
 * @param {String} teamId - id of the team.
 * @param {String} projectId - id of the project.
 * @param {Boolean} getJsObject if true, return a js object instead a mongoose object
 * @returns {Promise} - array of sprints
*/
sprintSchema.statics.getSprintsForTeam = async function(projectId, teamId, getJsObject=true) {
    

    let father = this;
    return new Promise( async function (resolve, reject){

        let response = {teamId: teamId};

        if (_.isUndefined(projectId) || _.isUndefined(teamId)){
            console.error("Invalid parameters");
            response['msg'] = "Sorry, There was a problem with the information received";
            return reject(response);
        }    

        // removing team from work items
        let err_msg = null;
        let sprints = undefined;

        if (getJsObject){
            sprints = await father.find( {projectId: projectId, teamId: teamId} ).lean().catch(err => {
                err_msg = err;
            }); 
        }else{
            sprints = await father.find( {projectId: projectId, teamId: teamId} ).catch(err => {
                err_msg = err;
            });    
        }
        
        // delete first work items
        if (err_msg || _.isUndefined(sprints)){
            response['msg'] = "Sorry, Cannot find the sprint for this team";
            return reject(response);
        }

            // format sprint date.
        for (let sprint of sprints) {
            sprint["startDateFormated"] = moment(sprint["startDate"], SPRINT_FORMAT_DATE).format("MMM Do");
            sprint["endDateFormated"] = moment(sprint["endDate"], SPRINT_FORMAT_DATE).format("MMM Do");

            sprint["tasks"] = sprint.tasks.map(each => each.toString());
        }

        resolve(sprints);
    });
};

/**
 * Update the sprints statuses
 * @param {String} projectId - id of the project
 * @param {Moment} currentDate - Moment date with the current date
 * @returns {Boolean} - True if any of the sprints was updated
*/
sprintSchema.statics.updateSprintsStatus = async function(projectId, currentDate) {
    
    let father = this;
    sprintStatusWasUpdated = false;
    return new Promise(async function(resolve, reject){

        if ( _.isUndefined(currentDate)  || _.isEmpty(currentDate)){
            return reject("Invalid parameter was passed");
        }

        let sprints = await father.find({projectId}).catch(err => {
            console.error(err);
        });

        if (_.isUndefined(sprints) || _.isNull(sprints)){
            return reject("Sorry, cannot find any sprint for the project");
        }
        
        // updating sprint status
        for (let i = 0; i < sprints.length; i++) {
            let sprint = sprints[i];
                
            // jump to the next iteration
            if (sprint && sprint.status == SPRINT_STATUS["Past"]){
                continue;
            }

            let startDate = sprint["startDate"];
            let endDate = sprint["endDate"];

            let newStatus = getSprintDateStatus(startDate, endDate, currentDate);

            // update only if status are different
            if (sprint.status != newStatus){

                sprint.status = newStatus;

                // saving the sprint status
                await sprint.save().catch(err => {
                    console.error(err);
                });

                sprintStatusWasUpdated = true;
            }
        }
        return resolve(sprintStatusWasUpdated);
    });

};

/**
 * Get the active sprint for the current Date.
 * @param {String} teamId - id of the team.
 * @returns {Object} - array of sprints
*/
sprintSchema.statics.getActiveSprint = function(sprints) {

    if (!_.isArray(sprints) || _.isEmpty(sprints)){
        return {};
    }
    
    let activeSprint = null;

    // check if there is any active sprint
    let thereIsActiveSprint = sprints.some( each => {
        return each["status"] == SPRINT_STATUS["Active"];
    });
    
    // if there is any active sprint, take it
    if (thereIsActiveSprint){

        // asing the active sprint
        activeSprint = sprints.filter( each => {
            return each["status"] == SPRINT_STATUS["Active"];
        })[0];
    
    // if there is not active sprint
    }else{

        // check if there is past sprints
        let thereIsPastSprint = sprints.some( each => {
            return each["status"] == SPRINT_STATUS["Past"];
        });

        // if there is past sprint, take it
        if (thereIsPastSprint){

            // assing the past sprint
            activeSprint = sprints.filter( each => {
                return each["status"] == SPRINT_STATUS["Past"];
            })[0];

        // if there is not active, and past sprint
        }else{
            
            // get the commit sprint
            activeSprint = sprints.filter( each => {
                return each["status"] == SPRINT_STATUS["Coming"];
            })[0];
        }
    }

    if (!_.isObject(activeSprint)){
        return {};
    }

    return activeSprint;
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


/**
 * Remove the work item from the sprints
 * @param {String} projectId - id of the project
 * @param {String} workItemId - if id the work item to remove 
 * @returns {Promise} true if the work item was remvoved
 */
sprintSchema.statics.removeWorkItemFromSprints = async function(projectId, workItemId) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        if (!_.isString(projectId) || !_.isString(workItemId)){
            console.error("Invalid parameters were received.");
            reject(false);
            return;
        }

        let sprint = await father.findOne({ projectId: projectId, tasks: workItemId}).catch(err => {
            console.error("Error getting the sprint: ", err);
        });

        if (_.isUndefined(sprint) || _.isNull(sprint)){
            return reject(false);
        }

        // removing element from sprint
        sprint["tasks"].pull(workItemId);

        let error_msg = undefined;

        // saving data
        await sprint.save().catch(err => {
            error_msg = err;
        });

        // check errors
        if (error_msg){
            return reject(false);
        }

        // console.log("Work item was removed from sprint");
        return resolve(true);
    });

};

/**
 * Remove the work item from the sprints
 * @param {String} projectId - id of the project
 * @param {String} workItemId - if id the work item to remove 
 * @returns {Promise} true if the work item was added
 */
sprintSchema.statics.addWorkItemToSprint = async function(projectId, workItemId, sprintId) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        if (!_.isString(projectId) || !_.isString(workItemId) || !_.isString(sprintId)){
            console.error("Invalid parameters were received.");
            return reject(false);
        }

        let wasAdded = await father.updateOne( 
            { projectId: projectId, _id: sprintId},
            {$push: {tasks: workItemId}})
            .catch(err =>{
                err_msg = err;
                console.error(err);
            }
        )

        if (_.isUndefined(wasAdded) || _.isNull(wasAdded) || !wasAdded["ok"]){
            reject(false);
            return;
        }

        console.log("Work item was added to the sprint from sprint: ");
        return resolve(true);
    });
};

/**
 * get the sprint where this work item belongs
 * @param {String} projectId - id of the project
 * @param {String} workItemId - if id the work item to remove 
 * @returns {Promise} sprint for the work item
 */
sprintSchema.statics.getSprintForWorkItem = async function(projectId, workItemId) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        if (!_.isString(projectId) || !_.isString(workItemId)){
            console.error("Invalid parameters were received.");
            return reject(false);
        }

        let err_msg = null;
        let sprint = await father.findOne( 
            { projectId: projectId, tasks: workItemId})
            .catch(err =>{
                err_msg = err;
                console.error("Error getting sprint for work item: ", err);
            }
        )
        
        if (_.isUndefined(sprint) || _.isNull(sprint)){
            return reject(err_msg);
        }

        return resolve(sprint);
    });
};

/**
 * get the sprint where this work item belongs
 * @param {String} projectId - id of the project
 * @param {String} workItemId - if id the work item to remove 
 * @returns {Promise} sprint for the work item
 */
 sprintSchema.statics.getWorkItemsForSprint = async function(projectId, tasks) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        if (!_.isString(projectId) || _.isEmpty(tasks)){
            return reject("Invalid parameters were received.");
        }

        let err_msg = null;
        let workItems = await WorkItemCollection.find({ projectId: projectId, _id: {$in: tasks}}).catch(err =>{
            err_msg = err;
            console.error(err);
        });
        
        if (_.isUndefined(workItems) || _.isNull(workItems)){
            return reject("Not work item found: " + err_msg);
        }

        return resolve(workItems);
    });
};


/**
 * get the team information for the sprint
 * @param {String} sprintId - id of the project
 * @returns {Promise} team for the sprint
 */
sprintSchema.statics.getSprintById = async function(projectId, sprintId) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        if (!_.isString(sprintId) || _.isEmpty(sprintId)){
            console.error(`Invalid parameters were received: sprintId: ${sprintId}`);
            return reject(false);
        }

        // ============= GETTING THE SPRINT ==============
        let err_msg = null;
        let sprint = await father.findOne( 
            { projectId: projectId, _id: sprintId})
            .catch(err =>{
                err_msg = err;
                console.error(err);
            }
        )
        
        if (_.isUndefined(sprint) || _.isNull(sprint) || err_msg){
            return reject(err_msg || "Error getting the sprint");
        }

        // ============= GETTING THE TEAM ==============
        return resolve(sprint);
    });
};


/**
 * get the order of the sprint by id 
 * @param {String} sprintId - Id of the sprint
 * @param {String} projectId - id of the project
 * @returns {Mongoose} object
 */
 sprintSchema.statics.getSprintOrder = async function(sprintId, projectId) {
    
    let error = undefined;

    let sprintOrder = await OrderSprintCollection.findOne(
        {sprintId: sprintId, projectId: projectId}
    ).catch(err => {
        error = err;
        console.error("err: ", err);
    });

    if (_.isUndefined(sprintOrder) || _.isNull(sprintOrder) || error != undefined){
    
        console.log("Creating new sprint order");

        //  ===== create order for sprint if cannot find one =====
        sprintOrder = await OrderSprintCollection.create({sprintId: sprintId, projectId: projectId}).catch(err => {
            console.error("Error creating the order for the sprint: ", err);
        });
    }

    if (_.isUndefined(sprintOrder) || _.isNull(sprintOrder) || error != undefined){
        return null;
    }

    return sprintOrder;
};


/**
 * Get the order of the sprint data
 * @returns 
 */
sprintSchema.methods.getSprintOrder = async function() {
    
    const sprint = this;

    let error = undefined;

    let sprintOrder = await OrderSprintCollection.findOne(
        {sprintId: sprint["_id"], projectId: sprint["projectId"]}
    ).catch(err => {
        error = err;
        console.error("err: ", err);
    });

    console.log(_.isUndefined(sprintOrder));
    console.log(_.isNull(sprintOrder));
    console.log(error);


    if (_.isUndefined(sprintOrder) || _.isNull(sprintOrder) || error != undefined){
    
        console.log("Creating new sprint order");

        //  ===== create order for sprint if cannot find one =====
        sprintOrder = await OrderSprintCollection.create({sprintId: sprint["_id"], projectId: sprint["projectId"]}).catch(err => {
            console.error("Error creating the order for the sprint: ", err);
        });
    }

    return sprintOrder;
};

/**
 * check if the sprint has a order schema
 * @returns {Boolean} - return true if the the sprint have a order schema
 */
 sprintSchema.methods.haveOrderSchema = async function() {
    
    return this.getSprintOrder() != null;
};


// // CREATION OF THE WORK ITEM TRIGGER THIS
// // deletion of the work item trigger this
// sprintSchema.pre('find', async function() {

//     const docToUpdate = await this.model.findOne(this.getQuery());
    
//     console.log(docToUpdate["tasks"].length);
//     // console.log("Current document: ", this)
//     // console.log(this["tasks"].length);
//     this.$locals.currentDocument = docToUpdate;
//     // console.log("PRE UPDATING");
// });

// sprintSchema.post('save', async function(doc) {
//     // const docToUpdate = await this.model.findOne(this.getQuery());
//     console.log("POST UPDATING");
//     // console.log(doc["tasks"].length)
//     console.log(this.$locals.currentDocument);
// });



module.exports = mongoose.model("Sprint", sprintSchema);
