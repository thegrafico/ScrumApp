/**
 * Front-end JS Code for planing-work-item route
 */

const newWorkItem = {
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
const createWorkItemModal = ".createNewItemModal";

const addTagBtn = "#addTagBtn";
const FILTER_BTN = "#filterBtn"
const tagContainer = ".tagsContainer";
const spanTitleMsg = "#title-span-msg";
const rmTag = ".rmTag";

// WORK ITEM TYPE
const BTN_CHANGE_WORK_ITEM_TYPE = ".btnType";
const INPUT_TYPE_HIDDEN_ELEMENT = "#workItemType";
const CURRENT_WORK_ITEM_TYPE = "#currentType";

// WORK ITEM STATUS
const BTN_CHANGE_WORK_ITEM_STATUS = ".btnWorkItemStatus";
const CURRENT_WORK_ITEM_STATUS = "#currentWorkItemStatus";
const INPUT_WORK_ITEM_STATUS = "#workItemStatus";

// CHECKBOX ROW ELEMENT IN TABLE
const TABLE_ROW_CHECKBOX_ELEMENT = ".checkboxRowElement";

// TRASH CAN ICON
const TRASH_BTN = "#trashBtn"; 

// ADD COMMENT - BUTTON
const BTN_ADD_COMMENT = "#add-comment";
const TEXT_AREA_ID = "#comment-textarea";

// WORK Item ID
const WORK_ITEM_ID = "#workItemId";

// PROJECT ID
const PROJECT_ID = "#projectId";

const CREATE_WORK_ITEM_FORM = "#createWorkItemForm";
const BTN_PLANING = "#Planing";

// TAG TEMPLATE FOR WORK ITEM
const tagTemplate = `<span class="badge badge-secondary"> <input type="text" name="tags[]" placeholder="Enter tag " class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;

const WORK_ITEM_TABLE = "#workItemTable";

const MAX_NUMBER_OF_TAGS = 4;
const MAX_LENGTH_TITLE = 80;
const HIGHLIGST_CLASS = "highligtRow";

// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    // click on planing just to show to the user in the sidebar
    $(BTN_PLANING).click();

    // TODO: Move this to another place or maybe add a function to handle the events in the checkbox
    $(TABLE_ROW_CHECKBOX_ELEMENT).on("click", function(){
        
        // get the parent element. In this case, it will be the the label element
        let _parent = $( this ).parent();

        // since we are changing the whole row, we need the element that has everything inside
        let granFather = $(_parent).parent().parent();

        let atLeastOneCheckBoxIsChecked = ($(`${TABLE_ROW_CHECKBOX_ELEMENT}:checked`).length > 0);
    
        enableTrashButton(atLeastOneCheckBoxIsChecked);
        
        if (_parent.hasClass("invisible")){
            _parent.removeClass("invisible");
            granFather.addClass(HIGHLIGST_CLASS);
        }else{
            _parent.addClass("invisible");
            granFather.removeClass(HIGHLIGST_CLASS);
        }
    });

    // ADD COMMENT 
    $(BTN_ADD_COMMENT).on("click", function(){
        
        const comment = $(TEXT_AREA_ID).val();
        const workItemId = $(WORK_ITEM_ID).val();
        const projectId = $(PROJECT_ID).val();
    
        if (workItemId == undefined || projectId == undefined){
            // TODO: add a message to the UI
            alert("There is a problem getting the information for this work item");
            return;
        }

        // TODO: clean text before inserting in database
        if ( (comment && comment.length > 0)){
            addCommentToWorkItem(projectId, workItemId, comment);
        }else{
            // TODO: show a message to the user that empty comment cannot be added
            alert("Cannot add an empty comment.")
        }
    });

    // REMOVE THE WORK ITEMS SELECTED IN CHECKBOX
    // TODO: Create a database modal to store deleted element
    $(TRASH_BTN).on("click", function(){
        alert("FOR NOW");
    });

    // ==================== CLEANING THE MODAL WHEM OPEN =================

    // clean the modal to add an user
    $(createWorkItemModal).on('shown.bs.modal', function (e) {
        $(newWorkItem["title"]).trigger("focus");
    });

    $(createWorkItemModal).on('show.bs.modal', function (e) {
        cleanModal();
    });

    // ================== CHEKING TITLE ERRORS =================

    //  PRIOR check if the title has already something in it
    if ($(newWorkItem["title"]).val().length == 0){
        showElement(spanTitleMsg);
    }

    // When title input is changed
    $(newWorkItem["title"]).on("input", function () {
        
        // Using functions from helper.js in order to show or hide the elements
        if ( (($(this).val()).length) > 0) {
            hideElement(spanTitleMsg);
        } else {
            showElement(spanTitleMsg);
        }
    });

    /**
     * Event to change the type of the work item
     */
    // TODO: maybe static icons? so when the user change the element it will always be at the same location
    $(BTN_CHANGE_WORK_ITEM_TYPE).on("click", function () {
        updateCustomSelect(this, CURRENT_WORK_ITEM_TYPE, INPUT_TYPE_HIDDEN_ELEMENT);
    });

    /**
     * Event to change the status of the work item
     */
    // TODO: maybe static icons? so when the user change the element it will always be at the same location
    $(BTN_CHANGE_WORK_ITEM_STATUS).on("click", function () {
        updateCustomSelect(this, CURRENT_WORK_ITEM_STATUS, INPUT_WORK_ITEM_STATUS);
    });

    // Add tag
    $(addTagBtn).on("click", function () {

        // get number of element
        let childrens = ($(tagContainer).children()).length;

        if (childrens <= MAX_NUMBER_OF_TAGS) {
            $(tagContainer).append(tagTemplate)
        } else {
            alert(`Each story cannot have more than ${MAX_NUMBER_OF_TAGS} tags`);
        }
    });

    /**
     * Event to remove the tag when the user click the 'x' button
     */
    $(document).on("click", rmTag, function () {
        $(this).parent().remove()
    });

    $(CREATE_WORK_ITEM_FORM).on("submit", function(event){
        isFormValid = validateFormWorkItem();
        console.log(isFormValid);
        if (!isFormValid){
            event.preventDefault();
        }

    });

    // TOGGLE THE FILTER
    $(FILTER_BTN).on("click", function() {
        toggleFilter()
    });

});


// TODO: this function does exist in the backlog - refactor
function cleanModal() {

    // reset title
    $(newWorkItem["title"]).val("");
    $(spanTitleMsg).removeClass("d-none");

    // reset assigned user
    $(newWorkItem["user"]).val(0);

    // reset tags
    $(`${tagContainer} span`).remove();

    // reset state
    // TODO: set the default value to be the firts from an array from CONSTANTS.js
    $(newWorkItem["state"]).val("New");

    // Reset description
    $(newWorkItem["description"]).val("");

    // reset points
    $(newWorkItem["points"]).val("");

    // reset priority
    $(newWorkItem["priority"]).val("");

    // reset discussion
    $(newWorkItem["discussion"]).val("");


    // TODO: reset links
    // TODO: reset type
    // TODO: reset team depending on the user's team
    // TODO: reset sprint depending on the current sprint
}

/**
 * 
 * @param {Object} currentElement - this element - current element
 * @param {String} tagCurrentItem - current tag item for the html
 * @param {String} tagInputItem - hidden input tag
 */
function updateCustomSelect(currentElement, tagCurrentItem, tagInputItem){
    // // get the current element
    let currentIcon = $(tagCurrentItem).html();        

    // get the clicked element
    let clickedIcon = $(currentElement).html();
    let selecteTextValue = $(currentElement).text().trim().toLowerCase();

    // store the current element in a temporal variable
    let temp = currentIcon;

    // clean the current element and change it with the clicked
    $(tagCurrentItem).empty().html(clickedIcon);

    // add the temporal element into the select options
    // $(currentElement).empty().html(temp)

    $(tagInputItem).val(selecteTextValue);
}

/**
 * This funtion validates the form to create a new WorkItem
 */
// TODO: change alert for other better ui messages
function validateFormWorkItem(){

    const title = $(newWorkItem["title"]).val().trim();
    // const state = $(newWorkItem["state"]).val();
    // const teamId = $(newWorkItem["team"]).val();
    // const type = $(newWorkItem["type"]).val();
    // const sprint = $(newWorkItem["sprint"]).val();
    const description = $(newWorkItem["description"]).val();
    const points = $(newWorkItem["points"]).val();
    const priority = $(newWorkItem["priority"]).val();

    // console.log(`POINTS: ${points}, Priority: ${priority}`);
   
    // Validate title
    if (title.length < 3){
        alert("Title cannot be less than 3 chars");
        return false;
    }

    // validate points
    if (!validator.isEmpty(points) && isNaN(points)){
        alert("Points only accept numbers");
        return false;
    }

     // validate priority
     if (!validator.isEmpty(priority) && isNaN(priority)){
        alert("Priority only accept numbers");
        return false;
    }

    return true;
}

/**
 * Enable the functionality for the trash button
 * @param {Boolean} enable - True if wants to enable the trash button, false if wants to disable
 */
function enableTrashButton(enable){
    
    if (enable){
        $(TRASH_BTN).attr("disabled", false);
        $(`${TRASH_BTN} i`).removeClass("grayColor");
        $(`${TRASH_BTN} i`).addClass("redColor");
    }else{
        $(TRASH_BTN).attr("disabled", true);
        $(`${TRASH_BTN} i`).removeClass("redColor");
        $(`${TRASH_BTN} i`).addClass("grayColor");
    }
}

/**
 * Add a comment to a work item for a project
 * @param {String} projectId 
 * @param {String} workItemId 
 * @param {String} comment 
 */
function addCommentToWorkItem(projectId, workItemId, comment){
    const api_link_add_comment = `/dashboard/api/${projectId}/addCommentToWorkItem/${workItemId}`;
    const request_data = {comment}

    $.post(
        api_link_add_comment, 
        request_data,
        function(data, status){
            console.log("Data: " + data + "\nStatus: " + status);
        }
    );
}


