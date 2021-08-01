
// TAG TEMPLATE FOR WORK ITEM
const TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" autocomplete="off" name="tags[]" placeholder="Enter tag" class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;
const UPDATE_TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" autocomplete="off" name="tags[]" placeholder="Enter tag" class='update-work-item-tags'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;

// Work item schema - all values that change from work item are in here
const WORK_ITEM = {
    // FOR WORK ITEM
    title: "#new-item-title",
    user: "#assignedUser",
    state: "#workItemStatus",
    team: "#teamAssigned",
    type: "#workItemType",
    description: "#description-textarea",
    points: "#workItemPoints",
    sprint: "#sprints",
    priority: "#workItemPriority",
    discussion: "#comment-textarea",
    tags: ".tagNme",

    current_type: "#currentType",
    current_status: "#currentWorkItemStatus",

    // OTHER DATA VALUES
    title_span_msg: "#title-span-msg",
    btn_add_comment: "#add-comment", 
    btn_change_type: ".btnType",
    btn_change_status: ".btnWorkItemStatus",
    btn_add_tags: "#addTagBtn",
    btn_remove_tag: ".rmTag",

    // CONTAINERS
    tag_container: ".tagsContainer",
    tag_template: TAG_TEMPLATE,

};

// same as work item but for the update part
const UPDATE_WORK_ITEM = {
    // FOR WORK ITEM
    title: "#update-work-item-title",
    user: "#update-assigned-user",
    state: "#update-work-item-status",
    team: "#update-work-item-team",
    type: "#update-work-item-type",
    description: "#update-work-item-description",
    points: "#update-work-item-points",
    sprint: "#update-work-item-sprints",
    priority: "#update-work-item-priority",
    discussion: "#update-work-item-comments",
    tags: ".update-work-item-tags",

    // OTHER VALUES
    title_span_msg: "#update-title-span-msg",
    btn_add_comment: "#update-add-comment",
    btn_change_type: ".update-btn-type",
    btn_change_status: ".update-btn-status",
    btn_add_tags: "#udpate-add-tags-btn",
    btn_remove_tag: ".rmTag",
    subId: "#update-work-item-sub-id",
    numberOfComments: "#update-number-of-comments",

    current_type: "#update-current-type",
    current_status: "#update-current-work-item-status",


    // CONTAINERS
    tag_container: ".update-tags-container",
    tag_template: UPDATE_TAG_TEMPLATE,


};

const WORK_ITEM_ICONS = {
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

// ============ WORK ITEM =============
const WORK_ITEM_STATUS = {
    "New":          "New",
    "Active":       "Active",
    "Review":       "Review",
    "Completed":    "Completed", 
    "Block":        "Block", 
    "Abandoned":    "Abandoned"
};

const WORK_ITEM_STATUS_COLORS = {
    "New":          {"class": "newColor", default: true},
    "Active":       {"class": "activeColor"}, 
    "Review":       {"class": "reviewColor"}, 
    "Completed":    {"class": "completedColor"}, 
    "Block":        {"class": "delectedColor"}, 
    "Abandoned":    {"class": "abandonedColor"}
};
// =============================


const createWorkItemModal = ".createNewItemModal";

// Symbol to replaces
const REPLACE_SYMBOL = "???***";

const addTagBtn = "#addTagBtn";
const FILTER_BTN = "#filterBtn"
const TAG_CONTAINER = ".tagsContainer";
const spanTitleMsg = "#title-span-msg";
const rmTag = ".rmTag";

// WORK ITEM TYPE
const BTN_CHANGE_WORK_ITEM_TYPE = ".btnType";
const CURRENT_WORK_ITEM_TYPE = ".currentType";

// WORK ITEM STATUS
const BTN_CHANGE_WORK_ITEM_STATUS = ".btnWorkItemStatus";
const CURRENT_WORK_ITEM_STATUS = ".currentWorkItemStatus";

// CHECKBOX ROW ELEMENT IN TABLE
const TABLE_ROW_CHECKBOX_ELEMENT_CONTAINER = ".tableCheckBoxRowElement";
const TABLE_ROW_CHECKBOX_ELEMENT = ".checkboxRowElement";
const TABLE_ROW_CHECKBOX_ELEMENT_CHECKED = ".checkboxRowElement:checked";

const CHECK_ALL_CHECKBOX_TABLE_ROWS = "#checkAllTableRow";

// FILTER TEAMS
const FILTER_BY_TEAM_INPUT = "#filterByTeam";
const FILTER_BY_TEAM_GENERAL_CLASS = ".seletedTeamToFilter";
const FILTER_BY_TEAM_MANAGE_INPUT = "#manage-filter-by-team";

// SAVE WORK ITEM BTN
const SAVE_WORK_ITEM_BTN = "#saveStatusBtn";

// TRASH CAN ICON
const TRASH_BTN_WORK_ITEM = "#trashBtnWorkItem";
const TRASH_BTN_MANAGE = "#trashBtnManage";
const TRASH_BTN_GENERAL_CLASS = ".trash-btn";

// ADD COMMENT - BUTTON
const BTN_ADD_COMMENT = "#add-comment";

// WORK Item ID
const WORK_ITEM_ID = "#workItemId";

// PROJECT ID
const PROJECT_ID = "#projectId";

const CREATE_WORK_ITEM_FORM = "#createWorkItemForm";
const BTN_PLANING = "#Planing";


const COMMENT_HTML_TEMPLATE = `<div> <textarea name="comments" class=" bx-shadow addCommentBox" rows="4" placeholder="Add a comment for this work item.">${REPLACE_SYMBOL}</textarea></div>`;
const USER_COMMENT_CONTAINER = ".user-comments-container";
const NUMBER_OF_COMMENTS_SPAN = "#numberOfCommentSpan";

// TAGS template for adding
const ADD_TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" name="tags[]" autocomplete="off" value="${REPLACE_SYMBOL}" placeholder="Enter tag " class='update-work-item-tags'> <span aria-hidden="true" class="rmTag">&times;</span></span>`;

const WORK_ITEM_TABLE = "#workItemTable";

const MAX_NUMBER_OF_TAGS = 4;
const MAX_LENGTH_TITLE = 80;
const MIN_LENGTH_TITLE = 3;
const MAX_PRIORITY_POINTS = 5;

const HIGHLIGST_CLASS = "highligtRow";

// DELETE TEAM CONSTASNT
const DELETE_TEAM_SUBMIT_BTN = "#delete-team-submit-btn";
const TEAM_SELECT_INPUT_ID = "#listOfTeams";

const MANAGE_TABLE_ID = "#manage-table";
const CURRENT_PAGE_ID = "#current-page";

const UPDATE_TYPE = {ADD: "ADD", DELETE: "DELETE", CHANGE: "CHANGE"};
const UPDATE_INPUTS = {USER: "USER", TEAM: "TEAM", SPRINT: "SPRINT"};

// find a way to create this in only one place. // also in db constants
const PAGES = {
    STATISTICS: "statistics",
    WORK_ITEMS: "workItems",
    UNIQUE_WORK_ITEM: "workItem",
    BACKLOG: "backlog",
    MANAGE_TEAM: "manageTeam",
    MANAGE_USER: "manageUser",
    MANAGE_SPRINT: "manageSprint", 
}

//  ======= SPRINT

// CREATE MODAL
const SPRINT_CREATE_MODAL_TEAM_INPUT = "#sprint-team-input";

// DELETE MODAL
const SPRINT_DELETE_MODAL_SELECT_TEAM = "#modal-remove-sprint-select-team";
const SPRINT_DELETE_MODAL_SELECT_SPRINT = "#modal-remove-sprint-select-sprint";

const SPRINT_FILTER_BY_SPRINT_SELECT = "#filterBySprint";

// GENERAL
const SPRINT_TIME_PERIDO_INPUT_ID = "#sprint-time-period";
const ONE_WEEK = 7;
const SPRINT_TIME_PERIOD = {
    "One Week": ONE_WEEK,
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

const UNASSIGNED_SPRINT = {
    name: "unassigned",
    _id: "0",
};

const MOVE_TO_BACKLOG_BTN = ".moveToBacklog";
const MOVE_TO_CURRENT_SPRINT_BTN = ".moveToCurrentSprintBtn";
const MOVE_TO_NEXT_SPRINT_BTN = ".moveToNextSprintBtn";

// if the function "updateSelectOption" changes, then this variable becomes true
let IS_UPDATE_SELECT_OPTION = false;
// =========== END

const CURRENT_USER_ID = "#current-user-id";