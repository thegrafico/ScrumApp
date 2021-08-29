/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose              = require("mongoose");
const moment                = require("moment");
const _                     = require("lodash");

const {
    WORK_ITEM_STATUS,
    ADD_TO_THE_BEGINNING
} = require("./Constanst");

const ObjectId = mongoose.Schema.ObjectId;

// Sprint Order DB model
let sprintOrderSchema = new mongoose.Schema({
    sprintId: {
        type: ObjectId,
        ref: "Sprint",
        required: true,
        unique: true,
    },
    projectId: {
        type: ObjectId,
        ref: "Project"
    },
    order:{

        sprintPlaning: {
            index : [{type: ObjectId, ref: "WorkItem"}],
        },

        sprintBoard: [
            {
                status: { 
                    type: String, 
                    enum: Object.keys(WORK_ITEM_STATUS),
                    required:true,
                },
                index : [{type: ObjectId, ref: "WorkItem"}],
            }
        ],
    },
});

/**
 * Remove work item from Sprint order 
 * @returns Remove work item from sprint order
*/
sprintOrderSchema.methods.removeWorkItem = async function(workItemId) {

    let sprintOrder = this;

    return new Promise(async function(resolve, reject){
        try {

            let orderKeys = Object.keys(sprintOrder["order"]);

            let orderWasUpdated = false;
            for (let location of orderKeys){
                let sprintOrderLocation = sprintOrder["order"][location];

                // if the element is an array
                if (_.isArray(sprintOrderLocation)){

                    // iterate the array - sprint board example
                    for (let locationStatus of sprintOrderLocation){
                        // get the index array since here is where we store the order
                        let index = locationStatus["index"];

                        if (_.isUndefined(index)) { continue;}

                        let foundWorkItem = index.includes(workItemId.toString());

                        // remove if found
                        if (foundWorkItem){
                            orderWasUpdated = true;
                            index.pull(workItemId);
                        }
                        
                    }
                }else if (_.isObject(sprintOrderLocation)){

                    let index = sprintOrderLocation["index"];

                    // in case of undefined
                    if (_.isUndefined(index)) { continue;}

                    let foundWorkItem = index.includes(workItemId.toString());

                    if (foundWorkItem){
                        orderWasUpdated = true;
                        index.pull(workItemId);
                    }

                }
            }

            if (orderWasUpdated){
                console.log("Saving new order...");
                
                let orderUpdated = await sprintOrder.save().catch(err => {
                    console.error("Error removing work item from sprint Order");
                });
    
                if (_.isUndefined(orderUpdated) || _.isNull(orderUpdated)){
                    return reject("Error updating the sprint order.");
                }
                
                return resolve(true);
            }
            
        } catch (error) {
            return reject(error);
        }
        
        return resolve(true);
    });

};


/**
 * Add a work item to the sprint order
 * @param {Array} workItemId - work item to be added
 * @returns 
 */
sprintOrderSchema.methods.addWorkItems = async function(workItems) {

    let sprintOrder = this;

    return new Promise(async function(resolve, reject){
        try {

            // check if work items were found
            if (_.isUndefined(workItems) || _.isEmpty(workItems)){
                return reject("Work Item received is either null or empty");
            }

            const orderKeys = Object.keys(sprintOrder["order"]);

            let orderWasUpdated = false;

            // update all work items received
            for( let workItem of workItems){

                for (let location of orderKeys){
                    let sprintOrderLocation = sprintOrder["order"][location];

                    // if the element is an array
                    if (_.isArray(sprintOrderLocation)){

                        // iterate the array - sprint board example
                        for (let locationStatus of sprintOrderLocation){

                            // get the location status for the work item
                            if (locationStatus["status"] == workItem["status"]){

                                console.log(`Adding work item to ${location}, status: ${workItem["status"]}`);
                                // get the index array since here is where we store the order

                                console.log("\n------");
                                console.log(locationStatus["index"]);

                                if (_.isUndefined(locationStatus["index"])) { continue;}

                                if (ADD_TO_THE_BEGINNING){
                                    locationStatus["index"].unshift(workItem["_id"]);
                                }else{
                                    locationStatus["index"].push(workItem["_id"]);
                                }

                                console.log(locationStatus["index"]);
                                console.log("\n------");

                                orderWasUpdated = true;
                            }
                            
                        }
                    }else if (_.isObject(sprintOrderLocation)){

                        // in case of undefined
                        if (_.isUndefined(sprintOrderLocation["index"])) { continue;}

                        if (ADD_TO_THE_BEGINNING){
                            sprintOrderLocation["index"].unshift(workItem["_id"]);
                        }else{
                            sprintOrderLocation["index"].push(workItem["_id"]);
                        }

                        orderWasUpdated = true;
                    }
                }
            }

            if (orderWasUpdated){
                console.log("Saving new order...");
                
                let orderUpdated = await sprintOrder.save().catch(err => {
                    console.error("Error adding work item from sprint Order");
                });
    
                if (_.isUndefined(orderUpdated) || _.isNull(orderUpdated)){
                    return reject("Error updating the sprint order.");
                }

                return resolve(true);
            }
            
        } catch (error) {
            return reject(error);
        }
        
        return resolve(true);
    });

};

module.exports = mongoose.model("SprintOrder", sprintOrderSchema);
