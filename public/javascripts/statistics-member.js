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

const NUMBERS_OF_MEMBERS_TEXT = "#number-of-members-text";
const NUMBER_OF_MEMBERS_VALUE = "#number-of-members-value";

const statusSelectId = "#projectStatus";
CHANGES = {
    "status": null,
    "description": null
};

// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    showActiveTab();

    const projectId = $("#projectId").val();

    // ============================================ STATUS CARD ==========================================
    $(projectStatus).on("change", function () {
        CHANGES["status"] = this.value;
    });
    // ===================================================================================================


    // Add a feedback whe the user click this button
    $(BTN_SAVE).on("click", function () {
        
        // TODO: get the id of the project
        const url = `http://localhost:3000/dashboard/${projectId}/update`;
        
        $.post(url, CHANGES, function (data, status) {
            console.log("Data: " + data + "\nStatus: " + status);
            alert("Data: " + data + "\nStatus: " + status);
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
 * 
 * @param updateType.ADD - action to add the members
 * @param updateType.DELETE - action to remove a member
 * @param {String} userId - if action delete, then userId should be populated 
 * @returns 
 */
function updateStatisticsHtml(updateType, valueToUpdate){
    let currentNumberOfMembers = $(NUMBER_OF_MEMBERS_VALUE).val();

    if (_.isEmpty(currentNumberOfMembers) || isNaN(currentNumberOfMembers)){
        return "Invalid number of users in project";
    }

    currentNumberOfMembers = parseInt(currentNumberOfMembers);

    if (updateType === UPDATE_TYPE.ADD){
        currentNumberOfMembers++;
        $(NUMBERS_OF_MEMBERS_TEXT).text(`${currentNumberOfMembers} members`);
        $(NUMBER_OF_MEMBERS_VALUE).val(currentNumberOfMembers);
    }else if(updateType === UPDATE_TYPE.DELETE){

        // updating text
        if (currentNumberOfMembers - 1 <= 1){
            $(NUMBERS_OF_MEMBERS_TEXT).text(`One man army`);
            $(NUMBER_OF_MEMBERS_VALUE).val(1);
        }else{
            $(NUMBERS_OF_MEMBERS_TEXT).text(`${--currentNumberOfMembers} members`);
            $(NUMBER_OF_MEMBERS_VALUE).val(currentNumberOfMembers);
        }
    }
}
