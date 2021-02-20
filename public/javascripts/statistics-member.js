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

$(function () {
    // BTN when the user submit the form information to create a new project
    $(btnAddUserSubmit).on("click", function (event) {

        // remove the default from the form so we can control when to submit the information. 
        event.preventDefault();

        // validating the form 
        isEmailValid = validator.isEmail($(userEmailId).val());

        if (!isEmailValid) {
            showErrSpanMessage(spanErrorEmailId, "Invalid email, please try again.");
            return;
        }

        // dont need this right now
        // hideErrSpanMessage(spanErrorEmailId);

        $(addMemberFormId).trigger("submit");

    });

    // BTN when the user submit the form information to create a new project
    $(btnRemoveUserSubmit).on("click", function (event) {
        // remove the default from the form so we can control when to submit the information. 
        event.preventDefault();

        // validating the form 
        isEmailValid = validator.isEmail($(emailToRemove).val());

        if (!isEmailValid) {
            showErrSpanMessage(spanErrorRemoveEmailId, "Invalid email, please try again.");
            return;
        }

        // dont need this right now
        // hideErrSpanMessage(spanErrorEmailId);

        $(removeMemberFormId).trigger("submit");

    });

    // clean the modal to add an user
    $(addMemberModalId).on('show.bs.modal', function (e) {
        $(userEmailId).val('');
    });

    // clean the modal for delete user
    $(removeMemberModalId).on('show.bs.modal', function (e) {
        $(emailToRemove).val('');
    });
});