// CREATE USER
const MODAL_ADD_USER_ID = "#add-user-project";
const MODAL_USER_EMAIl_INPUT = "#modal-user-email-input";
const MODAL_ADD_USER_BTN_SUBMIT = "#add-user-modal-btn";
const MODAL_SPAN_EMAIl_ERROR = "#modal-create-user-span-error";

// REMOVE USER
const MODAL_REMOVE_USER_ID = "#delete-user-modal";
const MODAL_REMOVE_USER_INPUT = "#modal-remove-user-select-user";
const MODAL_REMOVE_SUBMIT_BTN = "#modal-delete-user-submit-btn";

const TRASH_BTN_REMOVE_USER_PROJECT = "#trashBtnManageUser";

// UPDATE MODAL
const UPDATE_USER_MODAL = "#update-user";
const OPEN_UPDATE_USER_MODAL = ".btn-update-user-modal-open";
const UPDATE_MODAL_USER_NAME = "#user-name-input";
const UPDATE_MODAL_USER_EMAIL = "#user-email-input";
const UPDATE_MODAL_USER_PRIVILEGE = "#user-privilege-input";
const UPDATE_MODAL_USER_SUBMIT = "#update-user-btn-submit";

const SELECTED_USER_ID = "#updateUserId";

/**
 * This function is fire as soon as the DOM element is ready to process JS logic code
 * Same as $(document).ready()...
 */
$(function (){

    $(MODAL_REMOVE_USER_INPUT).select2();

    // BTN ADD USER
    $(MODAL_ADD_USER_BTN_SUBMIT).on("click", async function(event){
        let userEmail = $(MODAL_USER_EMAIl_INPUT).val().trim();
        
        if (!isEmail(userEmail)){
            showErrSpanMessage(MODAL_SPAN_EMAIl_ERROR, "Invalid email");
            return;
        }

        hideErrSpanMessage(MODAL_SPAN_EMAIl_ERROR);

        const {response, response_error} = await inviteUserToProject(userEmail);

        // Success message
        if (response){
            $.notify(response.msg, "success");
            cleanInput(MODAL_USER_EMAIl_INPUT);

            if (response.user){
                updateHtml( 
                    $(CURRENT_PAGE_ID).val(),
                    UPDATE_TYPE.ADD, 
                    {"value": response.user.id, "text": response.user.fullName}, 
                    UPDATE_INPUTS.USER,
                    response.user
                );
            }
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // BTN REMOVE USER
    $(MODAL_REMOVE_SUBMIT_BTN).on("click", async function(event){

        let userId = $(MODAL_REMOVE_USER_INPUT).val().trim();
        
        if (_.isNull(userId) || _.isUndefined(userId) || userId == "0"){
            $.notify("Invalid user.", "error");
            return;
        }

        const {response, response_error} = await removeUserFromProject(userId);

        // Success message
        if (!response_error){
            $.notify(response.msg, "success");
            cleanSelect(MODAL_REMOVE_USER_INPUT);
            updateHtml( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.DELETE, 
                response.userId, 
                UPDATE_INPUTS.USER
            );
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // TRASH BTN EVENT 
    $(TRASH_BTN_REMOVE_USER_PROJECT).on("click", async function(){
        
        let numberOfCheckedElements = getCheckedElementIds(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED, false).length;
        let userText = (numberOfCheckedElements > 1) ? "Users" : "user";
        let removeUsersData = {
            title: "Removing users",
            body: `Are you sure you want to remove ${numberOfCheckedElements} ${userText}?`,
            id: null,
            option: REMOVE_OPTIONS["USERS"]
        }
        setUpRemoveModal(removeUsersData);
    });

    // clean the project modal
    $(MODAL_ADD_USER_ID).on('shown.bs.modal', function (e) {
        $(MODAL_USER_EMAIl_INPUT).val(''); 
    });

    // clean the project modal
    $(MODAL_REMOVE_USER_ID).on('shown.bs.modal', function () {
        $(MODAL_REMOVE_USER_INPUT).val("0").trigger("change"); 
    });

    // OPEN UPDATE USER MODAL
    $(document).on("click", OPEN_UPDATE_USER_MODAL, function(){
        let userId = $(this).attr("id");

        // update this in case user is updated
        $(SELECTED_USER_ID).val(userId);
        
        let name        = $(`tr#${userId} td.values span.name`).text();
        let email       = $(`tr#${userId} td.values span.email`).text();
        let privilege   = $(`tr#${userId} td.values span.privilege`).text();

        let userPrivilege = getKeyByValue(USER_PRIVILEGES, privilege);

        $(UPDATE_MODAL_USER_NAME).val(name);
        $(UPDATE_MODAL_USER_EMAIL).val(email);
        $(UPDATE_MODAL_USER_PRIVILEGE).val(userPrivilege).change();

    });

    // SUBMIT USER CHANGES
    $(document).on("click", UPDATE_MODAL_USER_SUBMIT, async function(){
        const userId = $(SELECTED_USER_ID).val();
        
        // inital value when the page is loaded
        let privilege = $(`tr#${userId} td.values span.privilege`).text();
        let userPrivilege = getKeyByValue(USER_PRIVILEGES, privilege);

        // value that the user choose
        let selectedPrivilege = $(UPDATE_MODAL_USER_PRIVILEGE).val();

        if (userPrivilege === selectedPrivilege){
            $.notify("Oops, Nothing was changed.", "error");
            return;
        }

        let {response, response_error} = await updateUser(userId, {"privilege": selectedPrivilege});

        // Success message
        if (!response_error){
            
            $.notify(response["msg"], "success");

            // $(CLOSE_MODAL_SPRINT_BTN).click();

            // let sprintId = response["sprint"]["_id"];

            // updateTableElement(sprintId, response["sprint"], addSprintToTable);
            $(`${UPDATE_USER_MODAL} .close`).click();
        }else{ // error messages            
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });
});

/**
 * Remove users from the manage page
 * @param {Array} usersId 
 * @returns 
 */
async function removeUsersManage(usersId){

    if (!_.isArray(usersId) || _.isEmpty(usersId)){
        $.notify("Invalid users selected.", "error");
        return;
    }

    let {response, response_error} = await removeUsersFromProject(usersId);
    
    if (!response_error){
        removeCheckedElement();
        
        $.notify(response.msg, "success");
        
        // disable the trash button again
        enableTrashButton(false);

        for (let i = 0; i < response.userIds.length; i++) {
            let userId = response["userIds"][i];
            updateHtml( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.DELETE, 
                userId,
                UPDATE_INPUTS.USER
            );
        }
    }else{
        $.notify(response_error.data.responseJSON.msg, "error");
    }
}

