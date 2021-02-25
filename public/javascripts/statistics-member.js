const userEmailId = "#userEmail";
const btnAddUserSubmit = "#btnAddUser";
const addMemberModalId = "#create-user";
const spanErrorEmailId = "#createUserErrorMessage";
const addMemberFormId = "#inviteUserToProject";
const btnRemoveUserSubmit = "#btnRemoveUser";
const emailToRemove = "#removeUsersNameOrEmails";
const spanErrorRemoveEmailId = "#removeUserErrorMessage";
const removeMemberFormId = "#removeUserFromProject";
const removeMemberModalId = "#remove-user";

const BTN_SAVE = "#saveStatusBtn";

const statusSelectId = "#projectStatus";
CHANGES = {
    "status": null,
    "description": null
};

// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // console.log($(statusSelectId).find(":selected").text())

    // ============================================ STATUS CARD ==========================================
    $(projectStatus).on("change", function () {
        CHANGES["status"] = this.value;
    });
    // ===================================================================================================


    // Add a feedback whe the user click this button
    $(BTN_SAVE).on("click", function () {
        
        // TODO: get the id of the project
        const url = "http://localhost:3000/dashboard/6027fc80a40b46138321a5e0/update";
        
        $.post(url, CHANGES, function (data, status) {
            console.log("Data: " + data + "\nStatus: " + status);
        });

    });

    // ============================================ MEMBER CARD ==========================================
    // =========== ADD NEW USER ===========
    $(btnAddUserSubmit).on("click", function (event) {
        validateEmail(userEmailId, addMemberFormId, spanErrorEmailId, event);
    });

    // =========== REMOVE USER ===========
    $(btnRemoveUserSubmit).on("click", function (event) {
        validateEmail(emailToRemove, removeMemberFormId, spanErrorRemoveEmailId, event);
    });

    // clean the modal to add an user
    $(addMemberModalId).on('show.bs.modal', function (e) {
        $(userEmailId).val('');
    });

    // clean the modal for delete user
    $(removeMemberModalId).on('show.bs.modal', function (e) {
        $(emailToRemove).val('');
    });
    // ===================================================================================================

});

/**
 * Validate the email of the user, if the email is invalid show a message to the user using a span element
 * @param {String} emailId - input email id 
 * @param {String} formId - form id 
 * @param {String} spanId - id of the span to show the message 
 * @param {Object} event - event fired
 */
function validateEmail(emailId, formId, spanId, event) {

    // remove the default from the form so we can control when to submit the information. 
    event.preventDefault();

    // validating the form 
    isEmailValid = validator.isEmail($(emailId).val());

    if (!isEmailValid) {
        showErrSpanMessage(spanId, "Invalid email, please try again.");
        return;
    }

    $(formId).trigger("submit");
}