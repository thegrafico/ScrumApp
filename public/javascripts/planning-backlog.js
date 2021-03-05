const newWorkItem = {title: "#new-item-title"};
const createWorkItemModal = ".createNewItemModal";

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
});
