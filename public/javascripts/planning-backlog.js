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

const CREATE_WORK_ITEM_FORM = "#createWorkItemForm";
const BTN_PLANING = "#Planing";

const tagTemplate = `<span class="badge badge-secondary"> <input type="text" name="tags[]" placeholder="Enter tag " class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;

const WORK_ITEM_TABLE = "#workItemTable";

const MAX_NUMBER_OF_TAGS = 4;
const MAX_LENGTH_TITLE = 80;
CHANGES = {
    "status": null,
    "description": null
};

// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    // start dragg event
    startDraggable(WORK_ITEM_TABLE);

    // click on planing just to show to the user in the sidebar
    $(BTN_PLANING).click();

    // clean the modal to add an user
    $(createWorkItemModal).on('shown.bs.modal', function (e) {
        $(newWorkItem["title"]).trigger("focus");
    });

    $(createWorkItemModal).on('show.bs.modal', function (e) {
        cleanModal();
    });

    // When title input is changed
    $(newWorkItem["title"]).on("input", function () {
        let inputLength = ($(this).val()).length

        if (inputLength > 0) {
            $(spanTitleMsg).addClass("d-none");
        } else {
            $(spanTitleMsg).removeClass("d-none");
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

    var options = [];
    $( '.dropdown-menu a' ).on( 'click', function( event ) {

    var $target = $( event.currentTarget ),
        val = $target.attr( 'data-value' ),
        $inp = $target.find( 'input' ),
        idx;

    if ( ( idx = options.indexOf( val ) ) > -1 ) {
        options.splice( idx, 1 );
        setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
    } else {
        options.push( val );
        setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
    }

    $( event.target ).blur();
        
    console.log( options );
    return false;
    });

});

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

function startDraggable(tableId){

    $(tableId).sortable({
        items: 'tr.rowValues',
        cursor: 'row-resize',
        axis: 'y',
        dropOnEmpty: false,
        start: function (e, ui) {
            ui.item.addClass("selected");
        },
        stop: function (e, ui) {
            resetColumnOrder();
        }
    });
}

/**
 * This functions reset the counter column everytime a value is dragged to another possition
 */
function resetColumnOrder(){
    let counter = 1;
    $("th.orderColumn").each(function() {
        $(this).text(counter);
        counter++;
    });
}