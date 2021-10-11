
// id of the form 
const FORM_ID_CREATE_TEAM = "#createTeamForm";
const CREATE_TEAM_MODAL_ID = ".create-team-modal";
const CREATE_TEAM_SUBMIT_BTN = "#create-team-submit-btn";

const INPUT_TEAM_NAME = "#teamName";
const INPUT_TEAM_USERS = "#listOfUsers";
const INPUT_TEAM_LIST_OF_USERS = ".teamUserList";
const SPAN_ID_TEAM_NAME = "#teamNameSpanError";
const SPAN_ID_USER_LIST = "#teamUsersSpanError";
const INPUT_SUBMIT_TEAM = "#create-team-submit-btn";

const CLOSE_BTN_CREATE_TEAM = "#closeCreateTeamBtn";
const CLOSE_BTN_DELETE_TEAM = "#closeRemoveTeamBtn";

const TEAM_NAME_LENGHT_MAX_LIMIT = 20;
const TEAM_NAME_LENGHT_MIN_LIMIT = 3;


const SELECT_USERS_PROJECT_INPUT = "#project-user-select";

// Selected team for modals
const CURRENT_SELECTED_TEAM = "#currentSelectedTeam";

// TEAM TABLE
const ROW_TEAM_NAME = ".row-team-name";

// EDIT TEAM
const OPEN_EDIT_TEAM_MODAL = ".btn-update-team-modal-open";
const EDIT_TEAM_NAME_INPUT = "#team-name-input";
const BTN_SUBMIT_EDIT_TEAM = "#edit-team-btn-submit";

// VIEW USER TEAMS
const VIEW_TEAM_USERS_MODAL = "#view-team-users-modal";
const VIEW_TEAM_USERS_OPEN_MODAL = ".btn-view-user-modal-open";
const CONTAINER_SHOW_USERS = "#containerTeamUsers";
const FILTER_TEAM_USERS_INPUT = "#filter-team-users";
const ROW_TEAM_USER_NAME = ".team-user-name-row";
const ROW_TEAM_USER_CONTAINER = ".show-team-users-row-modal";
const REMOVE_USER_FROM_TEAM_TRASH_BTN = ".trashIconRemoveUserFromTeam";

// ADD USER TO TEAM
const ADD_USER_TO_TEAM_MODAL = "#add-user-to-team-modal";
const ADD_USER_TO_TEAM_BTN = "#btnAddUserToTeam";
const SELECT_TEAM_TO_ADD_USER_INPUT = "#select-team-to-add-user";
const SELECT_USER_TO_ADD_TO_TEAM_INPUT = "#select-user-to-add-to-team";


/**
 * This function is fire as soon as the DOM element is ready to process JS logic code
 * Same as $(document).ready()...
 */
$(function (){

    // make the select opction for deleting a team a select2 element
    $(DELETE_TEAM_SELECT_INPUT).select2();
    $(SELECT_USERS_PROJECT_INPUT).select2();
    $(FILTER_BY_TEAM_MANAGE_INPUT).select2();
    $(SELECT_TEAM_TO_ADD_USER_INPUT).select2();
    $(SELECT_USER_TO_ADD_TO_TEAM_INPUT).select2();

    // BTN when the user submit the form information to create a new user
    $(CREATE_TEAM_SUBMIT_BTN).on("click", async function(event){
        
        // remove the default from the form so we can control when to submit the information. 
        event.preventDefault();

        // TODO: verify team name is not already taken in the project
        const teamName = $(INPUT_TEAM_NAME).val().trim();
        const userId = $(INPUT_TEAM_USERS).attr('id').trim();

        // string, not empty and just letters
        const {isValid, reason} = validateTeamName(teamName);

        if (!isValid){
            showErrSpanMessage(SPAN_ID_TEAM_NAME, reason);
            return;
        }

        // Request var
        const projectId = getProjectId();
        const API_LINK_CREATE_TEAM = `/dashboard/api/${projectId}/newTeam`;
        const data = {"teamName": teamName};

        let response_error = null;
        const response = await make_post_request(API_LINK_CREATE_TEAM, data).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){
            $.notify(response.msg, "success");
            $(CLOSE_BTN_CREATE_TEAM).click();
            updateHtml( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.ADD, 
                {"value": response.team.id, "text": response.team.name},
                UPDATE_INPUTS.TEAM
            );
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // ================= DELETE TEAM EVENTS ================
    $(DELETE_TEAM_SUBMIT_BTN).on("click", async function(){
    
        let selectedTeamId = $(DELETE_TEAM_SELECT_INPUT).val();

        if (selectedTeamId == "0" || !_.isString(selectedTeamId) || _.isEmpty(selectedTeamId)){
            $.notify("Invalid team.", "error");
            return;
        }

        const projectId = getProjectId();

        const API_LINK_DELETE_TEAM = `/dashboard/api/${projectId}/deleteTeam`;

        let response_error = null;
        const response = await make_post_request( API_LINK_DELETE_TEAM, {"teamId": selectedTeamId} ).catch(err => {
            response_error = err;
        });

        if (response){
            $.notify(response.msg, "success");
            $(CLOSE_BTN_DELETE_TEAM).click();
            updateHtml( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.DELETE, 
                response.teamId,
                UPDATE_INPUTS.TEAM
            );
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // Team Name field
    $(INPUT_TEAM_NAME).keyup(function(){
        
        // get user selected name
        const teamName = $(this).val().trim();

        const {isValid, reason} = validateTeamName(teamName);

        if (!isValid){
            showErrSpanMessage(SPAN_ID_TEAM_NAME, reason);
            return;
        }

        hideErrSpanMessage(SPAN_ID_TEAM_NAME);
    });

    // User field
    $(INPUT_TEAM_USERS).on("change",function(){
        
        // get user selected name
        const userName = $(this).val().trim().toLowerCase();

        // getting all usernames
        const all_users = $(INPUT_TEAM_LIST_OF_USERS).map((_,element) => element.value.trim().toLowerCase()).get().filter( element => {
            return !_.isEmpty(element);
        });

        if (!all_users.includes(userName)){
            showErrSpanMessage(SPAN_ID_USER_LIST, "It looks like that user does not exits.");
            return;
        }

        hideErrSpanMessage(SPAN_ID_USER_LIST);
    });
    
    // clean the project modal
    $(CREATE_TEAM_MODAL_ID).on('show.bs.modal', function (e) {
        $(INPUT_TEAM_NAME).val('');
        $(INPUT_TEAM_USERS).val('');     
    });

    // TRASH BTN EVENT 
    $(TRASH_BTN_MANAGE).on("click", async function(){
        
        let checkedElements = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);
       
        // check if not empty
        if (!_.isArray(checkedElements) || _.isEmpty(checkedElements) ){return;}

        const projectId = getProjectId();
        const teamId = $(FILTER_BY_TEAM_MANAGE_INPUT).val();

        const data = {"teamId": teamId, "userIds": checkedElements};
        const API_LINK_REMOVE_USERS_FROM_TEAM = `/dashboard/api/${projectId}/removeUsersFromTeam/`

        let response_error = undefined;
        const response = await make_post_request(API_LINK_REMOVE_USERS_FROM_TEAM, data).catch(err => {
            response_error = err;
        });

        if (response){
            removeCheckedElement();

            $.notify(response.msg, "success");

            removeDisableAttr(SELECT_USERS_PROJECT_INPUT, checkedElements);
            
            // disable the trash button again
            enableTrashButton(false);
        }else{
            // TODO: response_error.data.responseJSON.msg?
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // ============= EDIT TEAM ===========

    // Submit the team changes - until now is just updating the name
    $(BTN_SUBMIT_EDIT_TEAM).on("click", async function(){

        const newTeamName = $(EDIT_TEAM_NAME_INPUT).val().trim();

        // check name
        if (_.isUndefined(newTeamName) || _.isEmpty(newTeamName)){
            $.notify("Sorry, The name for the team cannot be empty");
            return;
        }

        error_message = null;
        if (_.isEmpty(newTeamName)){
            error_message = "Team name cannot be empty.";
        }else if( !(/^[a-zA-Z\s]+$/.test(newTeamName)) ){
            error_message = "Team name cannot include symbols and numbers.";
        }else if(newTeamName.length < TEAM_NAME_LENGHT_MIN_LIMIT){
            error_message = "Team name to short.";
        }else if(newTeamName.length > TEAM_NAME_LENGHT_MAX_LIMIT){
            error_message = "Team name is to long.";
        }

        if (error_message){
            $.notify(error_message);
            showErrorBounceAnimation(EDIT_TEAM_NAME_INPUT);
            return;
        }

        // check len
        if(newTeamName.length < TEAM_NAME_LENGHT_MIN_LIMIT){
            $.notify("Sorry, The name for the team is to short");
            return;
        }else if (newTeamName.length > TEAM_NAME_LENGHT_MAX_LIMIT){
            $.notify("Sorry, The name for the team is to long");
            return;
        }

        // getting project id and team id in order to make the request
        const projectId = getProjectId();
        const teamId =  $(CURRENT_SELECTED_TEAM).val();

        // check data
        if (_.isUndefined(projectId) || _.isEmpty(projectId) || _.isUndefined(teamId) || _.isEmpty(teamId)){
            $.notify("Sorry, There was a problem getting information for the team. Please later");
            return;
        }

        const API_LINK_EDIT_TEAM = `/dashboard/api/${projectId}/editTeam/${teamId}`

        let response_error = undefined;
        const response = await make_post_request(API_LINK_EDIT_TEAM, {name: newTeamName}).catch(err => {
            response_error = err;
        });

        if (response){

            // update row with team name
            $(`tr#${teamId} .row-team-name`).text(newTeamName);

            // update modal for delete team 
            $(`${DELETE_TEAM_SELECT_INPUT} option[value="${teamId}"]`).text(newTeamName);

            $.notify(response.msg, "success");

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // Edit team name
    $(document).on("click", OPEN_EDIT_TEAM_MODAL, function(){

        let tableRow = $(this).parent().parent();

        const teamId = $(tableRow).attr("id");

        // getting team name
        let teamName = $(tableRow).find(ROW_TEAM_NAME).text().trim() || "";

        $(EDIT_TEAM_NAME_INPUT).val(teamName);

        // since this is to open the modal. update the hidden input in order to get the team id
        $(CURRENT_SELECTED_TEAM).val(teamId);
    });

    // ============== VIEW USERS ==============

    // before the modal is open
    $(document).on("click", VIEW_TEAM_USERS_OPEN_MODAL, async function(){

        let tableRow = $(this).parent().parent();

        const teamId = $(tableRow).attr("id");

        // send the request to get all users by the team
        const projectId = getProjectId();

        // check data
        if (_.isUndefined(projectId) || _.isEmpty(projectId) || _.isUndefined(teamId) || _.isEmpty(teamId)){
            $.notify("Sorry, There was a problem getting information for the team. Please later");
            return;
        }

        // update the current team selected
        $(CURRENT_SELECTED_TEAM).val(teamId);

        const API_LINK_GET_TEAM_USERS = `/dashboard/api/${projectId}/getTeamUsers/${teamId}`

        let response_error = undefined;
        const response = await make_get_request(API_LINK_GET_TEAM_USERS,).catch(err => {
            response_error = err;
        });

        if (!response_error){

            if (response["users"].length > 0){
                addUserToModal(response["users"]);
            }else{
                $.notify("Sorry, it seems this team does not have any user yet", "error");
                return;
            }

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // -- Search user in modal
    // When the modal is visible to the user
    $(VIEW_TEAM_USERS_MODAL).on("shown.bs.modal", function(){
        $(FILTER_TEAM_USERS_INPUT).focus();
    });

    // when the user type something in the search
    $(FILTER_TEAM_USERS_INPUT).on("keyup", function(){
        let searchInput = $(this).val().toLowerCase();

        $(ROW_TEAM_USER_NAME).each(function(){
            let rowText = $(this).text().trim().toLowerCase();

            let parentElement = $(this).parent();

            let isTextInRow = rowText.includes(searchInput);

            if (isTextInRow){
                $(parentElement).removeClass("d-none");
            }else{
                $(parentElement).addClass("d-none");
            }
        });
    });

    // remove user from team
    $(document).on("click", REMOVE_USER_FROM_TEAM_TRASH_BTN, async function(){
        let userId = $(this).parent().parent().attr("id");

        // getting project id and team id in order to make the request
        const projectId = getProjectId();
        const teamId =  $(CURRENT_SELECTED_TEAM).val();

        // check data
        if (_.isUndefined(projectId) || _.isEmpty(projectId) || _.isUndefined(teamId) || _.isEmpty(teamId)){
            $.notify("Sorry, There was a problem getting information for the team. Please later");
            return;
        }

        let request_data = {
            userIds: [userId],
            teamId: teamId,
        };

        const API_LINK_DELETE_USER_FROM_TEAM = `/dashboard/api/${projectId}/removeUsersFromTeam`;

        let response_error = undefined;
        const response = await make_post_request(API_LINK_DELETE_USER_FROM_TEAM, request_data).catch(err => {
            response_error = err;
        });

        if (response){

            $.notify(response.msg, "success");
            
            // change current number of user in UI
            $(`tr#${teamId} .column-view-team-users button`).text(response["numberOfUsers"]);

            $(`div${ROW_TEAM_USER_CONTAINER}#${userId}`).remove();

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
 
    });


    // ============== ADD USERS TO TEAM ==============

    $(SELECT_TEAM_TO_ADD_USER_INPUT).on("change", async function(){
        let teamId = $(this).val();

        if (_.isUndefined(teamId) || _.isNull(teamId)){
            $.notify("Sorry, There is a problem getting the team information");
            return;
        }

        // just in case the team is the unnasiged
        if (teamId == UNNASIGNED_VALUE){
            return;
        }

        // every time the user changes the team, clean and add default
        cleanAndaddDefaultToSelect(SELECT_USER_TO_ADD_TO_TEAM_INPUT, "Select an user");

        // Remove the disabled attribute
        $(SELECT_USER_TO_ADD_TO_TEAM_INPUT).attr("disabled", true);

        const projectId = getProjectId();

        const API_LINK_GET_USERS_NOT_IN_TEAM = `/dashboard/api/${projectId}/getTeamUsers/${teamId}?notInTeam=true`;
        let response_error = undefined;
        const response = await make_get_request(API_LINK_GET_USERS_NOT_IN_TEAM).catch(err => {
            response_error = err;
        });

        if (!response_error){
        
            // check if empty
            if (_.isEmpty(response["users"])){
                $.notify("Oops, it seems there are not users to add to this team.");
                return;
            }

            // Remove the disabled attribute
            $(SELECT_USER_TO_ADD_TO_TEAM_INPUT).attr("disabled", false);

            // add the team to the current select option
            for (let user of response["users"]){
                let optionValue = {text: user["fullName"], value: user["id"]};
                updateSelectOption(SELECT_USER_TO_ADD_TO_TEAM_INPUT, UPDATE_TYPE.ADD, optionValue);
            }
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // SUBMIT TO ADD THE USER 
    $(ADD_USER_TO_TEAM_BTN).on("click", async function(){
        const teamId = $(SELECT_TEAM_TO_ADD_USER_INPUT).val();
        const userId = $(SELECT_USER_TO_ADD_TO_TEAM_INPUT).val();

        // check data
        if (!_.isString(teamId) || _.isEmpty(teamId) || !_.isString(userId) || _.isEmpty(userId)){
            $.notify("Oops, There was a problem getting the information to add the user to the team. Please try again.");
            return;
        }

        const projectId = getProjectId();
        const API_LINK_ADD_USER_TO_TEAM = `/dashboard/api/${projectId}/addUserToTeam/`

        const data = {"userId": userId, "teamId": teamId};

        let response_error = null;
        const response = await make_post_request(API_LINK_ADD_USER_TO_TEAM, data).catch(err => {
            response_error = err;
        });


        if (!response_error){

            $.notify(response["msg"], "success");

            // update number of users for the team
            $(`tr#${teamId} .column-view-team-users button`).text(response["numberOfUsers"]);

            // remove user from the select option
            updateSelectOption(SELECT_USER_TO_ADD_TO_TEAM_INPUT, UPDATE_TYPE["DELETE"], userId);
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    }); 

    // on open modal to add the user to the team
    $(ADD_USER_TO_TEAM_MODAL).on("shown.bs.modal", function(){

        // change the team to the default
        updateSelectOption(SELECT_TEAM_TO_ADD_USER_INPUT, UPDATE_TYPE["CHANGE"], "0");

        // every time the modal is open, clean and add default
        cleanAndaddDefaultToSelect(SELECT_USER_TO_ADD_TO_TEAM_INPUT, "Select an user");

        // Remove the disabled attribute
        $(SELECT_USER_TO_ADD_TO_TEAM_INPUT).attr("disabled", true);
    });
    

});

function addUserToModal(users){

    // clan the container
    $(CONTAINER_SHOW_USERS).empty();

    for (let user of users){
        let divRow = `
        <div class="row show-team-users-row-modal" id="${user['id']}">
        
            <div class="col-10 colUserName team-user-name-row">
                <span>- ${user["fullName"]}</span>
            </div>

            <div class="col-2 my-auto">
                <i class="fas fa-trash trashIconRemoveUserFromTeam blockColor"></i>
            </div>
        </div>`;

        // add to the div
        $(CONTAINER_SHOW_USERS).append(divRow);
    }
}


/**
 * Validate the name of the team
 * @param {String} name - name of the team
 * @returns {Object} - {isValid: Boolean, reason: String or null}
 */
function validateTeamName(name){

    let error_message = null;

    // if empty
    if (_.isEmpty(name)){
        error_message = "Name cannot be empty";
    }else if( !(/^[a-zA-Z\s]+$/.test(name)) ){
        error_message = "Name cannot include symbols and numbers";
    }else if(name.length < TEAM_NAME_LENGHT_MIN_LIMIT){
        error_message = "Message is to short";
    }else if(name.length > TEAM_NAME_LENGHT_MAX_LIMIT){
        error_message = "Name is to big.";
    }

    return {"isValid": error_message == null, "reason": error_message};
}