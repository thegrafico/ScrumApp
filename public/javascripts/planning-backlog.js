const newWorkItem = {
    title: "#new-item-title",
    user: "#assignedUser",
    state: "#statusAssigned",
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
const currentIconId = "#currentType";
const addTagBtn = "#addTagBtn";
const tagContainer = ".tagsContainer";
const spanTitleMsg = "#title-span-msg";
const rmTag = ".rmTag";
const BTN_CHANGE_TYPE = ".btnType";
const INPUT_TYPE_HIDDEN_ELEMENT = "#workItemType";
const CREATE_WORK_ITEM_FORM = "#createWorkItemForm";
const BTN_PLANING = "#Planing";

const tagTemplate = `<span class="badge badge-secondary"> <input type="text" name="tags[]" placeholder="Enter tag " class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;

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
    $(BTN_CHANGE_TYPE).on("click", function () {

        // get the current element
        let currentIcon = $(currentIconId).html();        

        // get the clicked element
        let clickedIcon = $(this).html();
        let selecteTextValue = $(this).text().trim().toLowerCase();

        // store the current element in a temporal variable
        let temp = currentIcon;

        // clean the current element and change it with the clicked
        $(currentIconId).empty().html(clickedIcon);

        // add the temporal element into the select options
        $(this).empty().html(temp)

        $(INPUT_TYPE_HIDDEN_ELEMENT).val(selecteTextValue);
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
    $(newWorkItem["state"]).val(0);

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