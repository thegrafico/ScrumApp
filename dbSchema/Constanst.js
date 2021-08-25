const moment = require("moment");
const _ = require("lodash");


module.exports.projectStatus = ["New", "Active", "Completed", "Deleted", "Block", "Abandoned"];

module.exports.UNASSIGNED = {
    name: "unassigned",
    id: "0",
    selected: true
};

module.exports.UNASSIGNED_SPRINT = {
    name: "unassigned",
    _id: "0",
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
}

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
 * Create a new key joining the data
 * @param {String} s 
 * @returns {String} capizalize string
 */
module.exports.joinData = (dataA, dataB, keyA, action, keyB, newKey, defaultValue) => {

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
                    dataA[i][newKey] = {_id: b["_id"], name: b["name"]};
                    break;
                }

            }else if(action == "equal"){

                if (b && b[keyB].toString() == dataA[i][keyA]){
                    dataA[i][newKey] = {_id: b["_id"], name: b["name"]};
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
        sum += element["storyPoints"];
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




