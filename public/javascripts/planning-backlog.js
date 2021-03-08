const newWorkItem = {title: "#new-item-title"};
const createWorkItemModal = ".createNewItemModal";
const currentIconId = "#currentType";
const addTagBtn = "#addTagBtn";
const tagContainer = ".tagsContainer";
const rmTag = ".rmTag";

const tagTemplate = `<span class="badge badge-secondary"> <input type="text" name="tags" placeholder="Enter tag " class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;

const MAX_NUMBER_OF_TAGS = 4;
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

    // TODO: maybe static icons?
    $(".btnType").on("click", function(){
        let clickedIcon = $(this).html()
        let currentIcon = $(currentIconId).html();
        let temp = currentIcon;
        // console.log(clickedIcon);

        $(currentIconId).empty().html(clickedIcon);
        $(this).empty().html(temp)
        // console.log(currentIcon);
    });

    // Add tag
    $(addTagBtn).on("click", function(){
        

        // get number of element
        let childrens = ($(tagContainer).children()).length;

        if (childrens <= MAX_NUMBER_OF_TAGS){
            $(tagContainer).append(tagTemplate)
        }else{
            alert(`Each story cannot have more than ${MAX_NUMBER_OF_TAGS} tags`);
        }
    });

    $(document).on("click", rmTag, function(){
        $(this).parent().remove()
    })

});

function switchContenSpan(){
}
