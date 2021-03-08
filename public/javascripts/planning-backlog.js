const newWorkItem = {
    title: "#new-item-title",
    user: "#assignedUser",
    state: "#statusAssigned",
    description: "#description-textarea",
    points: "#workItemPoints",
    priority: "#workItemPriority",
    discussion: "#comment-textarea"
};
const createWorkItemModal = ".createNewItemModal";
const currentIconId = "#currentType";
const addTagBtn = "#addTagBtn";
const tagContainer = ".tagsContainer";
const spanTitleMsg = "#title-span-msg";
const rmTag = ".rmTag";

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

    // TODO: maybe static icons?
    $(".btnType").on("click", function () {
        let clickedIcon = $(this).html()
        let currentIcon = $(currentIconId).html();
        let temp = currentIcon;
        // console.log(clickedIcon);

        $(currentIconId).empty().html(clickedIcon);
        $(this).empty().html(temp)
        // console.log(currentIcon);
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

    $(document).on("click", rmTag, function () {
        $(this).parent().remove()
    })

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