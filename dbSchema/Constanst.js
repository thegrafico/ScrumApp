const moment = require("moment");
const _ = require("lodash");


module.exports.projectStatus = ["New", "Active", "Completed", "Deleted", "Block", "Abandoned"];

module.exports.UNASSIGNED = {
    name: "unassigned",
    _id: "0",
    selected: true
};

module.exports.UNASSIGNED_SPRINT = {
    name: "unassigned",
    _id: "0",
};

module.exports.UNASSIGNED_USER = {
    name: "unassigned",
    id: "0",
};

module.exports.userStatus = ["Active", "Inactive"];

// SPRINTS CONSTANTS
const ONE_WEEK = 7;
module.exports.SPRINT_DEFAULT_PERIOD_TIME = ONE_WEEK * 2; // TWO weeks sprint time
module.exports.SPRINT_TIME_PERIOD = {
    "One Week": ONE_WEEK, // Today - 6 days
    "Two Weeks": ONE_WEEK * 2, 
    "Three Weeks": ONE_WEEK * 3,
    "One Month": ONE_WEEK * 4,
    "Two Months": ONE_WEEK * 8,
};

const SPRINT_STATUS = {
    "Past": "Past", // Today - 6 days
    "Coming": "Coming", 
    "Active": "Active",
};
module.exports.SPRINT_STATUS = SPRINT_STATUS;


const PROJECT_INITIALS_COLORS = [
    "#2f4d6c",
    "#822bad",
    "#3ab8c5",
    "#15aabf",
    "#b32e6f",
    "#2487b6",
    "#2c81ba",
    "#5e38a4",
];
module.exports.PROJECT_INITIALS_COLORS = PROJECT_INITIALS_COLORS;

const SPRINT_FORMAT_DATE = "MM/DD/YYYY";
module.exports.SPRINT_FORMAT_DATE = SPRINT_FORMAT_DATE;
module.exports.ADD_SPRINT_TO_ALL_TEAM_ID = "ALL";



// STORY TYPE and ICONS
// TODO: add this to the database since other files is using it too
module.exports.WORK_ITEM_ICONS = {
    "Story": {
        icon: "fa-book-open cl-blue",
        default: true
    },
    "Task": {
        icon: "fa-clipboard-check"
    },
    "Research": {
        icon: "far fa-newspaper"
    },
    "Bug": {
        icon: "fa-bug cl-danger"
    },
    "Epic": {
        icon: "fa-bolt taskIcon"
    },
}


//  STATUS FOR THE WORK ITEMS
module.exports.WORK_ITEM_STATUS = {
    "New":          "New",
    "Active":       "Active",
    "Review":       "Review",
    "Completed":    "Completed", 
    "Block":        "Block", 
    "Abandoned":    "Abandoned"
};

//  This is the general work items to show to the user
module.exports.MAIN_WORK_ITEMS_TO_SHOW = ["New", "Active", "Review", "Block"];

// if we change the variable here, we need to change the fron-end js to in order to show the
// values in the dropdown select opction
module.exports.WORK_ITEM_STATUS_COLORS = {
    "New":          {"class": "newColor", default: true},
    "Active":       {"class": "activeColor"}, 
    "Review":       {"class": "reviewColor"}, 
    "Completed":    {"class": "completedColor"}, 
    "Block":        {"class": "blockColor"}, 
    "Abandoned":    {"class": "abandonedColor"}
};

// max number of tags per work item
module.exports.MAX_NUMBER_OF_TAGS_PER_WORK_ITEM = 4;

module.exports.MAX_NUMBER_OF_FAVORITE_PROJECTS = 3;


module.exports.MAX_LENGTH_TITLE = 80;

// MAX STORY POINTS
module.exports.MAX_STORY_POINTS = 500;
module.exports.MAX_PRIORITY_POINTS = 5;

// Max length of char for work item description
module.exports.MAX_LENGTH_DESCRIPTION = 1000;

// TEAM NAME LIMITS
module.exports.TEAM_NAME_LENGHT_MAX_LIMIT = 20;
module.exports.TEAM_NAME_LENGHT_MIN_LIMIT = 3;

module.exports.PRIORITY_POINTS = {
    "Low": 1,
    "Median": 2,
    "High": 3,
    "Highest": 4,
    "Critical": 5,
};

module.exports.PAGES = {
    STATISTICS: "statistics",
    WORK_ITEMS: "workItems",
    UNIQUE_WORK_ITEM: "workItem",
    BACKLOG: "sprintBacklog",
    SPRINT: "sprintPlaning",
    SPRINT_BOARD: "sprintBoard",
    MANAGE_TEAM: "manageTeam",
    MANAGE_USER: "manageUser",
    MANAGE_SPRINT: "manageSprint",
    QUERIES: "queries"
}

module.exports.ADD_TO_THE_BEGINNING = true;

// ========= QUERY ===================
module.exports.QUERY_FIELD = {
    ID:                     {text: "Work Item Id", dbField: "itemId"},
    WORK_ITEM_TITLE:        {text: "Work Item Title", dbField: "title"},
    ASSIGNED_USER:          {text: "Assigned User", dbField: "assignedUser"},
    STORY_POINTS:           {text: "Story Points", dbField: "storyPoints"},
    PRIORITY_POINTS:        {text: "Priority", dbField: "priorityPoints"},
    WORK_ITEM_STATUS:       {text: "Work Item Status", dbField: "status"},
    TEAM:                   {text: "Team", dbField: "team"},
    WORK_ITEM_TYPE:         {text: "Work Item Type", dbField: "type"},
    WORK_ITEM_DESCRIPTION:  {text: "Work Item Description", dbField: "description"},
    TAGS:                   {text: "Tags", dbField: "tags"},
    COMMENTS:               {text: "Comments", dbField: "comments"},
    WORK_ITEM_CREATION:     {text: "Work Item Creation Date", dbField: "createdAt"},
    SPRINT_NAME:            {text: "Sprint Name", dbField: "name"},
    SPRINT_START_DATE:      {text: "Sprint Start Date", dbField: "startDate"},
    SPRINT_END_DATE:        {text: "Sprint End Date", dbField: "endDate"},
    SPRINT_STATUS:          {text: "Sprint Status", dbField: "status"},
    SPRINT_POINTS:          {text: "Sprint Points", dbField: "initialPoints"}
}

const QUERY_OPERATOR = {
    EQUAL: "=",
    NOT_EQUAL: "<>",
    GREATER: ">",
    LESS: "<",
    GREATER_EQUAL: ">=",
    LESS_EQUAL: "<=",
    CONTAINS: "Contains",
    DOES_NOT_CONTAINS: "Does Not Contain",
    IN: "In",
    NOT_IN: "Not In",
    IS_EMPTY: "Is Empty",
    NOT_EMPTY: "Is Not Empty",
}
module.exports.QUERY_OPERATOR = QUERY_OPERATOR;

const QUERY_LOGICAL_CONDITION = {
    AND: "And",
    OR: "Or"
}
module.exports.QUERY_LOGICAL_CONDITION = QUERY_LOGICAL_CONDITION;

module.exports.QUERY_SPECIAL_VALUE = "[ANY]";

module.exports.USER_PRIVILEGES = {
    "MEMBER": "Member",
    "SCRUM_MASTER": "Scrum Master",
    "PRODUCT_OWNER": "Product Owner",
};


const WORK_ITEM_RELATIONSHIP = {
    RELATED:        {value: 1, text: "Is Related to",   title: "Related"},
    CHILD:          {value: 2, text: "Is Child of",     title: "Child"}, 
    PARENT:         {value: 3, text: "Is Parent of",    title: "Parent"}, 
    DUPLICATE:      {value: 4, text: "Is Duplicate by", title: "Duplicate by"}, 
    BLOCKED:        {value: 5, text: "Is Blocked By",   title: "Blocked by"},
    DUPLICATE_FROM: {value: 6, text: "Is Duplicating",  title: "Duplicating"},
    BLOCKING:       {value: 7, text: "Is Blocking",     title: "Bloking"}
};
module.exports.WORK_ITEM_RELATIONSHIP = WORK_ITEM_RELATIONSHIP;


// NOTIFICATION
const NOTIFICATION_TYPES = {
    "PROJECT_INVITATION":       { // User was invited to the project
        getMessage: (projectName) => {
            return `invited you to the project: ${projectName}`;
        },
        icon: "fas fa-folder",
        projectId: null,
    }, 
    "TEAM_ADDED":           {
        getMessage: (teamName) => {   // user was added to a team
            return `You were added to the team: ${teamName}`;
        },
        icon: "fas fa-users",
    },
    "MENTIONED":            {},   // user was mentioned
    "ASSIGNED_WORK_ITEM":   { // work item was assigned to user
        getMessage: (projectName, workItemItemId) => {
            return `${projectName}: Work Item ${workItemItemId} was assigned to you.`;
        },
        icon: "far fa-plus-square",
    }, 
    "WORK_ITEM_UPDATED":    {}, // Work item was updated (User assigned is notified) 
}
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

const NOTIFICATION = arrayToObject(Object.keys(NOTIFICATION_TYPES));
module.exports.NOTIFICATION = NOTIFICATION;

const NOTIFICATION_STATUS = {
    "NEW": "NEW",
    "ACTIVE": "ACTIVE",
    "INACTIVE": "INACTIVE",
};
module.exports.NOTIFICATION_STATUS = NOTIFICATION_STATUS;

// ====== ERROR CODES FROM MONGO =========
const ERROR_CODES = {
    "DUPLICATE_RECORD": 11000,
}
module.exports.ERROR_CODES = ERROR_CODES;

// ===================================



/**
 * Capitalize a String
 * @param {String} s 
 * @returns {String} capizalize string
 */
module.exports.capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Get the status of the sprints
 * @param {String} startDate - Start date
 * @param {String} endDate - end date
 * @param {Moment} currentDate - Moment current day, default is new Date()
 * @param {String} format -format of the startDate and endDate
 * @return {String} Status of the sprint
*/
module.exports.getSprintDateStatus = function(startDate, endDate, currentDate = moment(new Date()), format = SPRINT_FORMAT_DATE){

    _startDate = moment(startDate, format);
    _endDate = moment(endDate, format);

    let sprintStatus = ""; // default?
    if (currentDate.isAfter(_endDate)){
        sprintStatus = SPRINT_STATUS["Past"];
    }else if(currentDate.isBefore(_startDate)){
        sprintStatus = SPRINT_STATUS["Coming"];
    }else if(currentDate.isBetween(_startDate, _endDate)){
        sprintStatus = SPRINT_STATUS["Active"];
    }

    return sprintStatus;
}

/**
 * Join data B into A. 
 * @param {Array} dataA Main data
 * @param {Array} dataB - Data to be copied into A
 * @param {String} keyA Key value for A
 * @param {String} action - action
 * @param {String} keyB - key value for b
 * @param {String} newKey - new key to be added to dataA
 * @param {Object} defaultValue - default cases
 * @param {Boolean} addFullValue - instead of adding some values, is this is true, the full dataB will be added to the new key
 * @returns 
 */
module.exports.joinData = (dataA, dataB, keyA, action, keyB, newKey, defaultValue, addFullValue = false) => {

    // early exit condition
    // SINCE WE'RE JOINING DATA B INTO A, WE DON"T NEED TO CHECK IF DATA B IS EMPTY 
    // COUSE DATA A WILL HAVE THE DEFAULT VALUE
    if (!_.isArray(dataA) || !_.isArray(dataB) || _.isEmpty(dataA)){
        return;
    }

    // adding the sprint to the work item
    for (let i = 0; i < dataA.length; i++) {
        dataA[i][newKey] = defaultValue;
        for (let b of dataB){

            if (action == "is in"){

                if (b && b[keyB] && b[keyB].includes(dataA[i][keyA].toString())){
                    if (addFullValue){
                        dataA[i][newKey] = b
                    }else{
                        dataA[i][newKey] = {_id: b["_id"], name: b["name"]};
                    }
                    break;
                }

            }else if(action == "equal"){

                if (b && b[keyB].toString() == dataA[i][keyA]){
                    if (addFullValue){
                        dataA[i][newKey] = b

                    }else{
                        dataA[i][newKey] = {_id: b["_id"], name: b["name"]};
                    }
                    break;
                }

            }
            
        }
    }
}

/**
 * Sort an array by the key (date)
 * @param {Array} elements - array to sort
 * @param {String} dateKey - sorting key
 * @param {String} dateFormat - format of the day. Null for general
 * @param {String} how - 'asc' or 'des'
 * @returns 
 */
module.exports.sortByDate = (elements, dateKey, dateFormat=SPRINT_FORMAT_DATE, how="asc") => {

    if (how === "asc"){

        if (dateFormat){
            return elements.sort((a,b) => new moment(b[dateKey], dateFormat) - new moment(a[dateKey], dateFormat));
        }else{
            return elements.sort((a,b) => new moment(b[dateKey]) - new moment(a[dateKey]));
        }
    }

    if (dateFormat){
        return elements.sort((a,b) => new moment(a[dateKey], dateFormat) - new moment(b[dateKey], dateFormat));
    }else{
        return elements.sort((a,b) => new moment(a[dateKey]) - new moment(b[dateKey]));
    }

}

/**
 * 
 * @param {Array} elements - array of objects 
 * @param {String} key - key to sort
 * @param {String} how  - asc, desc
 * @param {String} valueType  - string || number
 * @returns 
 */
module.exports.sortByKey = (elements, key, how="asc", valueType = "string") => {

    if (how === "asc"){

        if (valueType === "string"){
            return elements.sort((a, b) => a[key].toLowerCase() > b[key].toLowerCase() ? 1 : -1);
        }

        return elements.sort((a, b) => a[key] > b[key] ? 1 : -1);
    }


    if (valueType === "string"){
        return elements.sort((a, b) => a[key].toLowerCase() < b[key].toLowerCase() ? 1 : -1);
    }

    return elements.sort((a, b) => a[key] < b[key] ? 1 : -1);

}

/**
 * Get number of elements in the array equal to the value
 * @param {Array} data - array with the elements
 * @param {Any} value - Value to look on the array
 * @param {Boolean} notIn - if true, return number of elements different than the value
 * 
 * @returns 
 */
module.exports.getNumberOfElements = (data, value, notIn = false) => {
    
    if (notIn){
        return data.filter(each => {return each["status"] != value}).length;
    }

    return data.filter(each => {return each["status"] == value}).length;

}

/**
 * 
 * @param {Array} data - array of object 
 * @param {String} status - status to filter
 * @param {Boolean} notIn - status not equal
 * @returns {Array}
 */
module.exports.filteByStatus = (data, status, notIn = false) => {
    
    if (notIn){
        return data.filter(each => {return each["status"] != status});
    }

    return data.filter(each => {return each["status"] == status});

}

/**
 * Get number of elements in the array equal to the value
 * @param {Array} data - array with the elements
 * @param {Any} value - Value to look on the array
 * @param {Boolean} notIn - if true, return number of elements different than the value
 * 
 * @returns 
 */
module.exports.getNumberOfDays = (dateA, dateB) => {
    
    let dA = moment(dateA, SPRINT_FORMAT_DATE);
    let dB = moment(dateB, SPRINT_FORMAT_DATE);


    if (!dA.isValid() || !dB.isValid()){
        console.error("Invalid dates");
        return -1;
    }

    return Math.abs(dB.diff(dA, 'days'));
}

/**
 * Get number of elements in the array equal to the value
 * @param {Array} data - array with the elements
 * @param {Any} filterValue - Value to look on the array
 * @param {Boolean} notIn - if true, return number of elements different than the value
 * 
 * @returns 
 */
module.exports.getPointsForStatus = (data, filterValue = null, notIn=false) => {
    let arr = undefined;
    
    if (filterValue){
    
        if (notIn){
            arr = data.filter(each => {return each["status"] != filterValue});
        }else{
            arr = data.filter(each => {return each["status"] == filterValue});
        }
        
    }else{
        arr = data;
    }
    
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        sum += parseInt(element["storyPoints"]);
    }

    return sum;
}


/**
 * Order work items by desired order
 * @param {Object} workItems - work items separated by type
 * @param {Array} desiredOrder - order of the work item
 * @returns {Object}
 */
module.exports.sortByOrder = (workItems, desiredOrder, location, revertOrder = false) => {
    // console.log("Sorting by order...");
    let sorted = undefined;

    switch(location){
        case "sprintBacklog":
        case "sprintPlaning":
            
        sorted = undefined;

            desiredOrderObject = {};
            
            for (let i = 0; i < desiredOrder.length; i++) {
                desiredOrderObject[desiredOrder[i]] = i;
            }

            sorted = workItems.sort(function(a, b) {

                if (revertOrder){
                    return desiredOrderObject[b["_id"]] - desiredOrderObject[a["_id"]];
                }
                return desiredOrderObject[a["_id"]] - desiredOrderObject[b["_id"]]

            ;});
            return sorted;
            
            break;
        case "sprintBoard":
            let statuses = Object.keys(workItems);

            sorted = {};

            for (const status of statuses){

                let desiredOrderForStatus = desiredOrder.filter(each => {return each["status"] === status})[0];
                
                let workItemsStatus = workItems[status];
            
                desiredOrderForStatusObject = {};
                
                for (let i = 0; i < desiredOrderForStatus["index"].length; i++) {
                    desiredOrderForStatusObject[desiredOrderForStatus["index"][i]] = i;
                }

                sorted[status] = workItemsStatus.sort(function(a, b) {

                    if (revertOrder){
                        return desiredOrderForStatusObject[b["_id"]] - desiredOrderForStatusObject[a["_id"]];
                    }

                    return desiredOrderForStatusObject[a["_id"]] - desiredOrderForStatusObject[b["_id"]]

                ;});
            }
            return sorted;
            break;
        default: 
            break;
    }


    return sorted;
}

/**
 * get the order of for the work items in the sprint
 * @param {Object} sprint 
 * @param {Array} workItems 
 * @param {String} location 
 * @returns 
 */
module.exports.setSprintOrder = async function(sprint, workItems, location){
    let temp = [];

    // if the sprint board have never been set

    switch(location){
        case "sprintPlaning":
        case "sprintBacklog":
            let workItemsIds = workItems.map(each => {return each["_id"]});
            
            sprint["order"][location]["index"] = workItemsIds;

            await sprint.save().catch(err => {
                console.error("Error saving the order: ", err);
            });

            break;
        case "sprintBoard":
            // adding first time
            for (let status of Object.keys(workItems)){
                const workItemsIds = workItems[status].map(each => {return each["_id"]});
                temp.push({status: status, index: workItemsIds})
            }

            sprint["order"][location] = temp;

            await sprint.save().catch(err => {
                console.error("Error saving the order: ", err);
            });
            break;
        default: 
            break; 
    }

    return sprint;
}

/**
 * Update the order of the sprint
 * @param {Object} sprint 
 * @param {Object} order 
 * @returns 
 */
module.exports.updateSprintOrderIndex = async function updateSprintOrderIndex(sprint, order, addNewToTheBeginning=false){

    let sprintTasks = sprint["tasks"];
    let orderWorkItems = order["order"]["sprintPlaning"]["index"];

    // getting work items in order that only are in the sprint
    let cleanOrder = orderWorkItems.filter( workItemId => {
        return sprintTasks.includes(workItemId.toString());
    });

    // if the clean order is the same of the sprint, then we return the order
    // couse we just remove elements and dont need to add. 
    if (cleanOrder.length == sprintTasks.length){
        order["order"]["sprintPlaning"]["index"] = cleanOrder;

        await order.save().catch(err=> {
            console.error("Error saving new order: ", err);
        });

        // saving sprint
        sprint["tasks"] = cleanOrder;
        await sprint.save().catch(err=> {
            console.error("Error saving sprint: ", err);
        });
        return;
    }

    // getting new work items from the sprint that were not in the order
    let newWorkItemsFromSprint = sprintTasks.filter((workItemId) => {
        return !cleanOrder.includes(workItemId);
    });

    for (let workItemId of newWorkItemsFromSprint){

        if (addNewToTheBeginning){
            // add the work items to the beginning of the order
            cleanOrder.unshift(workItemId);
        }else{
            // add the work items to the end of the order
            cleanOrder.push(workItemId);
        }
    }

    // update the order
    order["order"]["sprintPlaning"]["index"] = cleanOrder;

    // saving order
    await order.save().catch(err=> {
        console.error("Error saving new order: ", err);
    });

    // saving sprint
    sprint["tasks"] = cleanOrder;
    await sprint.save().catch(err=> {
        console.error("Error saving sprint: ", err);
    });
}


/**
 * Return an new array with the queries divided by logical condition the way the query should be done. 
 * @param {Array} query - query array of object
 * @returns 
 */
module.exports.cleanQuery = (query) => {

    // early exit condition 
    if (_.isEmpty(query)){ return [];}

    let masterQuery = [];
    let tempQuery = [];
    for (let i = 0; i < query.length; i++) {
        
        // every row query by the user
        const rowQuery = query[i];

        // add the current query
        tempQuery.push(rowQuery);

        // check if the next element is and
        if ( 
            ( (i + 1) < query.length) &&  // there is a next element available
            ( query[i + 1]["andOr"]) == QUERY_LOGICAL_CONDITION["AND"] ){ // next element is and AND condition
            
            // Since the next condition is an AND, then we add the prev. row queries
            masterQuery.push(tempQuery);

            // cleaning the previews querie array
            tempQuery = [];

        }

    }

    // in case we there is not more and and the masterQuery never gets updated. 
    if (!_.isEmpty(tempQuery)){
        masterQuery.push(tempQuery);
    }

    return masterQuery;
}

const INVALID_SYMBOLS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
/**
 * Check if a string contains symbols
 * @param {String} string 
 */
function containsSymbols(string){
    return INVALID_SYMBOLS.test(string);
}
module.exports.containsSymbols = containsSymbols;



/**
 * Get an object form and array. every element is the key and the value
 * @param {Array} arr 1D array
 * @returns {Object} object with keys/values with the value of the each array element
 */
function arrayToObject(arr){
    return arr.reduce((acc,curr)=> (acc[curr]=curr,acc),{});
}
module.exports.arrayToObject = arrayToObject;


/**
 * check if the work item value math the user value by operator
 * @param {Any} workItemValue 
 * @param {Any} userValue 
 * @param {String} operator 
 * @param {Boolean} isDate 
 * @returns 
 */
function checkEqualityOperators(workItemValue, userValue, operator, isDate){

    const OPERATOR = arrayToObject(Object.keys(QUERY_OPERATOR));

    let valueMatch = false;
    if (isDate){
        // check is a valid date
        if (moment(userValue, SPRINT_FORMAT_DATE).isValid()){

            switch (operator) {
                case OPERATOR["GREATER"]:
                    valueMatch = moment(workItemValue, SPRINT_FORMAT_DATE).isAfter(userValue);
                    break;
                case OPERATOR["LESS"]:
                    valueMatch = moment(workItemValue, SPRINT_FORMAT_DATE).isBefore(userValue);
                    break;
                case OPERATOR["GREATER_EQUAL"]:
                    valueMatch = moment(workItemValue, SPRINT_FORMAT_DATE).isSameOrAfter(userValue);
                    break;
                case OPERATOR["LESS_EQUAL"]:
                    valueMatch = moment(workItemValue, SPRINT_FORMAT_DATE).isSameOrBefore(userValue);
                    break;
                default:
                    valueMatch = false;
                    break;
            }
        }else{
            valueMatch = false;
        }
    }else{ // assume is number

        // is not empty and is a number and 
        if (!_.isEmpty(userValue) && !isNaN(userValue) && !isNaN(workItemValue)){
            switch (operator) {
                case OPERATOR["GREATER"]:
                    valueMatch = workItemValue > userValue;
                    break;
                case OPERATOR["LESS"]:
                    valueMatch = workItemValue < userValue;
                    break;
                case OPERATOR["GREATER_EQUAL"]:
                    valueMatch = workItemValue >= userValue;
                    break;
                case OPERATOR["LESS_EQUAL"]:
                    valueMatch = workItemValue <= userValue;
                    break;
                default:
                    valueMatch = false;
                    break;
            }
        }else{ // is string at this point
            valueMatch = false;
        }
    }

    return valueMatch;

}
module.exports.checkEqualityOperators = checkEqualityOperators;


/**
 * 
 * @param {Any} workItemValue 
 * @param {String} operator 
 * @param {Any} userValue 
 * @param {Boolean} isDate 
 * @returns 
 */
function doesQueryValueMatch(workItemValue, operator, userValue, isDate = false){

    let valueMatch = false;

    const OPERATOR = arrayToObject(Object.keys(QUERY_OPERATOR));

    if (isDate){
        userValue = moment(userValue, SPRINT_FORMAT_DATE); 
    }

    //TODO: add moment date validation

    switch (operator) {
        case OPERATOR["EQUAL"]:

            if (isDate){
                valueMatch =  moment(workItemValue, SPRINT_FORMAT_DATE).isSame(userValue);
            }else{
                valueMatch = (workItemValue.toString().toLowerCase() === userValue.toString().toLowerCase());
            }

            break;
        case OPERATOR["NOT_EQUAL"]:
            if (isDate){
                valueMatch =  moment(workItemValue, SPRINT_FORMAT_DATE).isSame(userValue);
            }else{
                valueMatch = (workItemValue.toString().toLowerCase() != userValue.toString().toLowerCase());
            }
            
            break;
        case OPERATOR["GREATER"]:
        case OPERATOR["LESS"]:
        case OPERATOR["GREATER_EQUAL"]:
        case OPERATOR["LESS_EQUAL"]:
            valueMatch = checkEqualityOperators(workItemValue, userValue, operator, isDate);
            break;
        case OPERATOR["CONTAINS"]:
            valueMatch = workItemValue.toString().toLowerCase().includes(userValue.toString().toLowerCase());
            break;
        case OPERATOR["DOES_NOT_CONTAINS"]:
            valueMatch = !(workItemValue.toString().toLowerCase().includes(userValue.toString().toLowerCase()));
            break;
        // TODO: finish here
        case OPERATOR["IN"]:
            break;
        case OPERATOR["NOT_IN"]:
            break;
        case OPERATOR["IS_EMPTY"]:
            break;
        case OPERATOR["NOT_EMPTY"]:
            break;
        default:
            break;
    }

    return valueMatch;
}
module.exports.doesQueryValueMatch = doesQueryValueMatch;

/**
 * Setup the initials for the project
 * @param {Object} project 
 * @param {Number} colorIndex 
 */
function setupProjectInitials(project, colorIndex=3){

    project["initials"] = getInitials(project.title);
    project["initialsColors"] = PROJECT_INITIALS_COLORS[colorIndex];
}
module.exports.setupProjectInitials = setupProjectInitials;

/**
 * Get first letter of each world inside str
 * @param {String} str - String to get initials
 */
function getInitials(str, numberOfInitials=2){
    let initials = "";

    let strArray = str.split(" ");
    if (strArray.length > 1) {

        let limit =  ((numberOfInitials > strArray.length))?  strArray.length :numberOfInitials;

        for (let i = 0; i < limit; i++) {
            initials += strArray[i][0].toUpperCase();
        }
    } else {
        let limit =  ((numberOfInitials > str.length))?  str.length :numberOfInitials;

        for (let i = 0; i < limit; i++) {
            initials += str[i].toUpperCase();
        }
    }

    return initials;
}
module.exports.getInitials = getInitials;


/**
 * Base on the relationship, set a new relationship for the work item
 * @param {String} relationship 
 * @returns 
 */
function getRelationShipForWorkItem(relationship){
    
    const RELATIONSHIP = arrayToObject(Object.keys(WORK_ITEM_RELATIONSHIP));

    let newRelationship = relationship;
    switch (relationship) {

        // If the relationship is child, then this work item is the parent
        case RELATIONSHIP["CHILD"]:
            newRelationship = RELATIONSHIP["PARENT"];
            break;
        // If the relationship is parent, then this work item is the child
        case RELATIONSHIP["PARENT"]:
            newRelationship = RELATIONSHIP["CHILD"];
            break;
        // If the relationship is duplicate by, then this work item is the duplicate from
        case RELATIONSHIP["DUPLICATE"]:
            newRelationship = RELATIONSHIP["DUPLICATE_FROM"];
            break;
        // If the relationship is Blocked by, then this work item is the one blocking
        case RELATIONSHIP["BLOCKED"]:
            newRelationship = RELATIONSHIP["BLOCKING"];
            break;
        default:
            break;
    }
    return newRelationship;
}
module.exports.getRelationShipForWorkItem = getRelationShipForWorkItem;


/**
 * 
 * @param {Array} comments - Work Item comments
 * @param {Array} users - users of the projects 
 * @param {String} userId - Id of the current User 
 */
function addUserNameToComment(comments, users, userId){
    let formatedComments = [];
    
    for (let comment of comments){
        let user = users.filter( each => {
            return (each["id"] || "").toString() === (comment["author"] || "").toString();
        })[0];
        
        let userName = "User not found";

        if (user){
            userName = user["name"];
        }
        let myComment = {...comment}
        
        myComment["userName"] = userName;
        myComment["isMyComment"] = (comment["author"] || "").toString() === (userId || "").toString();
        
        formatedComments.push(myComment);
    }

    console.log(formatedComments);
    return formatedComments;
}
module.exports.addUserNameToComment = addUserNameToComment;

/**
 * Print a error message to the console.
 * @param {Any} msg 
 */
function printError(msg){
    console.error("\n=======================");
    console.error(msg);
    console.error("=======================\n");
}
module.exports.printError = printError;


/**
 * Validate if the string is valid in len and if the string includes symbols and numbers
 * @param {String} str 
 * @param {Number} minLen 
 * @param {Number} maxLen 
 * @param {Boolean} checkSymbols 
 * @param {Boolean} checkSpaces 
 */
function validateString(str, minLen, maxLen, checkSymbols, checkSpaces){

    let errorMessage = null;

    // Validating team name
    if (_.isEmpty(str)){
        errorMessage = "empty";
    }else if(checkSymbols && !(/^[a-zA-Z\s]+$/.test(str)) ){
        errorMessage = "contains numbers or symbols";
    }else if(str.length < minLen){
        errorMessage = "to short";
    }else if(str.length > maxLen){
        errorMessage = "to big";
    }else if (minLen === maxLen && str.length != minLen){
        errorMessage = "is out of bounds";
    }else if (checkSpaces && str.includes(' ')){
        errorMessage = "Includes spaces";
    }

    return {isValid: errorMessage == null, reason: errorMessage};
}
module.exports.validateString = validateString;
