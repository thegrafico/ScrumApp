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
    BACKLOG: "backlog",
    SPRINT: "sprintPlanning",
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
 * @param {String} key - sorting key
 * @returns 
 */
module.exports.sortByDate = (elements, keyA, how="asc") => {

    if (how === "asc"){
        return elements.sort((a,b) => new moment(b[keyA], SPRINT_FORMAT_DATE) - new moment(a[keyA], SPRINT_FORMAT_DATE));
    }

    return elements.sort((a,b) => new moment(a[keyA], SPRINT_FORMAT_DATE) - new moment(b[keyA], SPRINT_FORMAT_DATE));
}