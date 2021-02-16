
const userEmailId = "#userEmail";
const btnAddUserSubmit = "#btnAddUser";
const addMemberModalId = "#create-user";
const spanErrorEmailId = "#createUserErrorMessage";
const addMemberFormId = "#inviteUserToProject";

$(function() {
    // BTN when the user submit the form information to create a new project
    $(btnAddUserSubmit).on("click", function(event){
        
        // remove the default from the form so we can control when to submit the information. 
        event.preventDefault();

        // validating the form 
        isEmailValid = validator.isEmail($(userEmailId).val());

        if (!isEmailValid){
            showErrSpanMessage(spanErrorEmailId, "Invalid email, please try again.");
            return;
        }

        // dont need this right now
        // hideErrSpanMessage(spanErrorEmailId);

        $(addMemberFormId).trigger("submit");
        
    });

    // clean the project modal
    $(addMemberModalId).on('show.bs.modal', function (e) {
        $(userEmailId).val('');
    });
});