
// Work item schema - all values that change from work item are in here
const WORK_ITEM = {
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
};

const WORK_ITEM_ICONS = {
    "Story": {
        icon: "fa-book-open cl-blue",
        default: true
    },
    "Task": {
        icon: "fa-clipboard-check"
    },
    "Bug": {
        icon: "fa-bug cl-danger"
    },
    "Epic": {
        icon: "fa-bolt taskIcon"
    },
}

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
const CURRENT_WORK_ITEM_TYPE = "#currentType";

// WORK ITEM STATUS
const BTN_CHANGE_WORK_ITEM_STATUS = ".btnWorkItemStatus";
const CURRENT_WORK_ITEM_STATUS = "#currentWorkItemStatus";

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

// TAG TEMPLATE FOR WORK ITEM
const TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" autocomplete="off" name="tags[]" placeholder="Enter tag " class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;
const COMMENT_HTML_TEMPLATE = `<div> <textarea name="comments" id="comment-textarea" rows="4" placeholder="Add a comment for this story." class="bx-shadow">${REPLACE_SYMBOL}</textarea></div>`;
const USER_COMMENT_CONTAINER = ".user-comments-container";
const NUMBER_OF_COMMENTS_SPAN = "#numberOfCommentSpan";

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

const UPDATE_TYPE = {ADD: "ADD", DELETE: "DELETE"};
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

const MOVE_TO_BACKLOG_BTN = ".moveToBacklog";
const MOVE_TO_CURRENT_SPRINT_BTN = ".moveToCurrentSprintBtn";
const MOVE_TO_NEXT_SPRINT_BTN = ".moveToNextSprintBtn";


// =========== END