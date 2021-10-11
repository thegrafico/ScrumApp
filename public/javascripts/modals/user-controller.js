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

    // BTN ADD USER
    $(MODAL_ADD_USER_BTN_SUBMIT).on("click", async function(event){
        let userEmail = $(MODAL_USER_EMAIl_INPUT).val().trim();
        
        if (!isEmail(userEmail)){
            showErrSpanMessage(MODAL_SPAN_EMAIl_ERROR, "Invalid email");
            return;
        }

        hideErrSpanMessage(MODAL_SPAN_EMAIl_ERROR);

        const projectId = getProjectId();

        if (!_.isString(projectId)){
            $.notify("Sorry, Cannot find the project at this moment.", "error");
            return;
        }

        const API_LINK_ADD_USER_TO_PROJECT = `/dashboard/api/${projectId}/addUserToProject`;
        let data = {"userEmail": userEmail};

        let response_error = null;
        let response = await make_post_request(API_LINK_ADD_USER_TO_PROJECT, data).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){
            $.notify(response.msg, "success");
            cleanInput(MODAL_USER_EMAIl_INPUT);

            if (response.user){
                updateHtml( 
                    $(CURRENT_PAGE_ID).val(),
                    UPDATE_TYPE.ADD, 
                    {"value": response.user.id, "text": response.user.fullName}, 
                    UPDATE_INPUTS.USER
                );

                addUserToTable(response.user);
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

        const projectId = getProjectId();

        if (!_.isString(projectId)){
            $.notify("Sorry, Cannot find the project at this moment.", "error");
            return;
        }

        const API_LINK_REMOVE_USER_FROM_PROJECT = `/dashboard/api/${projectId}/deleteUserFromProject`;
        const data = {"userId": userId};

        let response_error = null;
        const response = await make_post_request(API_LINK_REMOVE_USER_FROM_PROJECT, data).catch(err => {
            response_error = err;
        });
        
        // Success message
        if (response){
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
    
        let checkedElements = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);
        
        // check if not empty
        if (!_.isArray(checkedElements) || _.isEmpty(checkedElements) ){
            $.notify("Invalid users were selected", "error");
            return;
        }

        const projectId = getProjectId();

        const data = {"userIds": checkedElements};
        const API_LINK_REMOVE_USERS_FROM_PROJECT = `/dashboard/api/${projectId}/deleteUsersFromProject/`

        let response_error = undefined;
        const response = await make_post_request(API_LINK_REMOVE_USERS_FROM_PROJECT, data).catch(err => {
            response_error = err;
        });

        if (response){
            removeCheckedElement();
            
            $.notify(response.msg, "success");

            removeDisableAttr(SELECT_USERS_PROJECT_INPUT, checkedElements);
            
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

        const projectId = getProjectId();

        // API link
        const API_LINK_UPDATE_USER = `/dashboard/api/${projectId}/updateUser`;

        let response_error = null;
        const response = await make_post_request(API_LINK_UPDATE_USER, {userId: userId, privilege: selectedPrivilege}).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){
            
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


// API link
// const API_LINK_UPDATE_SPRINT = `/dashboard/api/${projectId}/updateSprint/${teamId}/${sprintId}`;

// let response_error = null;
// const response = await make_post_request(API_LINK_UPDATE_SPRINT, data).catch(err => {
//     response_error = err;
// });

// // Success message
// if (response){
    
//     $.notify("Sprint Updated", "success");

//     $(CLOSE_MODAL_SPRINT_BTN).click();

//     let sprintId = response["sprint"]["_id"];

//     updateTableElement(sprintId, response["sprint"], addSprintToTable);

// }else{ // error messages
//     $.notify(response_error.data.responseJSON.msg, "error");
// }