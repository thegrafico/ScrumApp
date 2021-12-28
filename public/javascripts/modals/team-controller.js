
// CREATE TEAM
const CREATE_TEAM_MODAL_ID = ".create-team-modal";
const OPEN_CREATE_TEAM_MODAL = ".open-create-team-modal"

const INPUT_TEAM_NAME = "#teamName";
const INPUT_TEAM_INITIALS = "#teamInitials";

// submit btns
const BTN_SUBMIT_CREATE_TEAM = "#create-team-submit-btn";
const BTN_SUBMIT_EDIT_TEAM = "#edit-team-submit-btn";

// Modal Titles for create and edit
const MODAL_CREATE_TEAM_TITLE = "#title-new-team";
const MODAL_EDIT_TEAM_TITLE = "#title-edit-team";

// Span errors
const SPAN_ID_TEAM_NAME = "#teamNameSpanError";
const SPAN_ID_USER_LIST = "#teamUsersSpanError";

const CLOSE_BTN_CREATE_TEAM = "#closeCreateTeamBtn";
const CLOSE_BTN_DELETE_TEAM = "#closeRemoveTeamBtn";

const TEAM_NAME_LENGHT_MAX_LIMIT = 20;
const TEAM_NAME_LENGHT_MIN_LIMIT = 3;


const SELECT_USERS_PROJECT_INPUT = "#project-user-select";

// Selected team for modals
const CURRENT_SELECTED_TEAM = "#current-selected-team";

// TEAM TABLE
const ROW_TEAM_NAME = ".row-team-name";
const ROW_TEAM_INITIALS = ".row-team-initials";

// EDIT TEAM
const OPEN_EDIT_TEAM_MODAL = ".btn-update-team-modal-open";
const EDIT_TEAM_NAME_INPUT = "#team-name-input";

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

    // CREATE NEW TEAM
    $(BTN_SUBMIT_CREATE_TEAM).on("click", async function(event){
       
        // remove the default from the form so we can control when to submit the information. 
        event.preventDefault();

        const teamName = $(INPUT_TEAM_NAME).val().trim();
        const teamInitials = $(INPUT_TEAM_INITIALS).val().trim();

        // string, not empty and just letters
        const {isValid, reason} = validateTeamName(teamName);

        if (!isValid){
            showErrSpanMessage(SPAN_ID_TEAM_NAME, reason);
            return;
        }

        const initialsValidation = validateTeamName(teamInitials, 3, 3);

        if (!initialsValidation.isValid){
            addSClassToElement(SPAN_ID_USER_LIST, "text-danger");
            return;
        }

        const {response, response_error} = await createTeam(teamName, teamInitials);

        // Success message
        if (!response_error){

            // show message to user
            $.notify(response.msg, "success");

            // close modal
            $(CLOSE_BTN_CREATE_TEAM).click();

            // update UI
            updateHtml( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.ADD, 
                {"value": response.team.id, "text": response.team.name},
                UPDATE_INPUTS.TEAM,
                {team: response["team"]}
            );
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // EDIT TEAM
    $(BTN_SUBMIT_EDIT_TEAM).on("click", async function(e){
        e.preventDefault();

        const teamName = $(INPUT_TEAM_NAME).val().trim();
        const teamInitials = $(INPUT_TEAM_INITIALS).val().trim();

        // getting team id in order to make the request
        const teamId = $(CURRENT_SELECTED_TEAM).val();

        // check teamId
        if (_.isUndefined(teamId) || _.isEmpty(teamId)){
            $.notify("Sorry, There was a problem getting information for the team. Please later");
            return;
        }

        // string, not empty and just letters
        const nameValidation = validateTeamName(teamName);
        const initialsValidation = validateTeamName(teamInitials, 3, 3);

        if (!nameValidation.isValid){
            showErrSpanMessage(SPAN_ID_TEAM_NAME, nameValidation.reason);
            return;
        }

        if (!initialsValidation.isValid){
            addSClassToElement(SPAN_ID_USER_LIST, "text-danger");
            return;
        }

        const {response, response_error} = await editTeam(teamId, {"name": teamName, "initials": teamInitials});

        if (!response_error){

            // update row with team name
            $(`tr#${teamId} ${ROW_TEAM_NAME}`).text(teamName);
            $(`tr#${teamId} ${ROW_TEAM_INITIALS}`).text(teamInitials);

            // update modal for delete team 
            $(`${DELETE_TEAM_SELECT_INPUT} option[value="${teamId}"]`).text(teamName);

            $.notify(response.msg, "success");

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // CREATE TEAM - OPEN MODAL
    $(document).on("click", OPEN_CREATE_TEAM_MODAL, function(){       
        
        // toggle title for modal
        $(MODAL_EDIT_TEAM_TITLE).hide();
        $(MODAL_CREATE_TEAM_TITLE).show();
        
        // toggle button for submit
        $(BTN_SUBMIT_EDIT_TEAM).hide();
        $(BTN_SUBMIT_CREATE_TEAM).show();

        // since this is to open the modal. update the hidden input in order to get the team id
        $(CURRENT_SELECTED_TEAM).val('');
    });

    // EDIT TEAM - OPEN MODAL
    $(document).on("click", OPEN_EDIT_TEAM_MODAL, function(){

        let tableRow = $(this).parent().parent();

        const teamId = $(tableRow).attr("id");

        // getting team name
        const teamName = $(tableRow).find(ROW_TEAM_NAME).text().trim() || "";
        const teamInitials = $(tableRow).find(ROW_TEAM_INITIALS).text().trim() || "";

        $(INPUT_TEAM_NAME).val(teamName);
        $(INPUT_TEAM_INITIALS).val(teamInitials);
        
        // toggle title for modal
        $(MODAL_EDIT_TEAM_TITLE).show();
        $(MODAL_CREATE_TEAM_TITLE).hide();
        
        // toggle button for submit
        $(BTN_SUBMIT_EDIT_TEAM).show();
        $(BTN_SUBMIT_CREATE_TEAM).hide();

        // since this is to open the modal. update the hidden input in order to get the team id
        $(CURRENT_SELECTED_TEAM).val(teamId);
    });

    // clean the project modal
    $(CREATE_TEAM_MODAL_ID).on('show.bs.modal', function (e) {
        $(INPUT_TEAM_NAME).val('');
        $(INPUT_TEAM_INITIALS).val('');
    });

    // ================= DELETE TEAM EVENTS ================
    $(DELETE_TEAM_SUBMIT_BTN).on("click", async function(){
    
        let selectedTeamId = $(DELETE_TEAM_SELECT_INPUT).val();

        if (selectedTeamId == "0" || !_.isString(selectedTeamId) || _.isEmpty(selectedTeamId)){
            $.notify("Invalid team.", "error");
            return;
        }

        const {response, response_error} = await deleteTeamFromProject(selectedTeamId);

        if (!response_error){
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

    // TRASH BTN EVENT 
    $(TRASH_BTN_MANAGE).on("click", async function(){

        const getOnlyVisibleElements = false;
        let numberOfCheckedElements = getCheckedElementIds(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED, getOnlyVisibleElements).length;
        let removeText = (numberOfCheckedElements > 1) ? "Teams" : "Team";
        let removeData = {
            title: "Removing Teams",
            body: `Are you sure you want to remove ${numberOfCheckedElements} ${removeText}?`,
            id: null,
            option: REMOVE_OPTIONS["TEAMS"]
        }
        
        setUpRemoveModal(removeData);
    });

    // ================= INPUTS EVENTS ================
    // Team Name field
    $(INPUT_TEAM_NAME).keyup(function(){
        
        // get user selected name
        const teamName = $(this).val().trim();

        const {isValid, reason} = validateTeamName(teamName);
        
        $(INPUT_TEAM_INITIALS).val( getTeamInitials(teamName) )

        if (!isValid){
            showErrSpanMessage(SPAN_ID_TEAM_NAME, reason);
            return;
        }

        
        hideErrSpanMessage(SPAN_ID_TEAM_NAME);
    });

    // Team Initials field
    $(INPUT_TEAM_INITIALS).keyup(function(){

        let teamInitials = $(this).val();

        const {isValid, reason} = validateTeamName(teamInitials, 3, 3);

        if (!isValid){
            addSClassToElement(SPAN_ID_USER_LIST, "text-danger");
            return;
        }

        removeClassToElement(SPAN_ID_USER_LIST, "text-danger");
    });
  
    // ============== VIEW USERS ==============

    // before the modal is open
    $(document).on("click", VIEW_TEAM_USERS_OPEN_MODAL, async function(){

        let tableRow = $(this).parent().parent();

        const teamId = $(tableRow).attr("id");

        // check data
        if (_.isUndefined(teamId) || _.isEmpty(teamId)){
            $.notify("Sorry, There was a problem getting information for the team. Please later");
            return;
        }

        // update the current team selected
        $(CURRENT_SELECTED_TEAM).val(teamId);

        const {response, response_error} = await getTeamUsers(teamId);

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

        // user to be removed
        let userId = $(this).parent().parent().attr("id");
  
        const teamId =  $(CURRENT_SELECTED_TEAM).val();

        // check data
        if (_.isUndefined(teamId) || _.isEmpty(teamId)){
            $.notify("Sorry, There was a problem getting information for the team. Please later");
            return;
        }

        const {response, response_error} = await removeUserFromTeam(teamId, [userId]);

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

        let getUsersNotInThisTeam = true;
        let {response, response_error} = await getTeamUsers(teamId, getUsersNotInThisTeam);

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

        // add user to team
        let {response, response_error} = await addUserToTeam(teamId, userId);

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
                - <span class="team-user-name">${user["fullName"]}</span>
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
 * Remove team from project
 * @param {Array} teamIds - team ids
 * @returns 
 */
async function removeTeamManage(teamIds){

    // check if not empty
    if (!_.isArray(teamIds) || _.isEmpty(teamIds) ){
        $.notify("Invalid teams selected.", "error");
        return;
    }

    const {response, response_error} = await deleteTeamsFromProject(teamIds);

    if (!response_error){
        removeCheckedElement();

        $.notify(response.msg, "success");

        removeDisableAttr(SELECT_USERS_PROJECT_INPUT, teamIds);
        
        // disable the trash button again
        enableTrashButton(false);
    }else{
        $.notify(response_error.data.responseJSON.msg, "error");
    }
}

/**
 * Validate the name of the team
 * @param {String} name - name of the team
 * @returns {Object} - {isValid: Boolean, reason: String or null}
 */
function validateTeamName(name, minLimit=TEAM_NAME_LENGHT_MIN_LIMIT, maxLimit= TEAM_NAME_LENGHT_MAX_LIMIT){

    let error_message = null;

    // if empty
    if (_.isEmpty(name)){
        error_message = "Name cannot be empty";
    }else if( !(/^[a-zA-Z\s]+$/.test(name)) ){
        error_message = "Name cannot include symbols and numbers.";
    }else if(name.length < minLimit){
        error_message = "Message is to short.";
    }else if(name.length > maxLimit){
        error_message = "Name is to big.";
    }else if (minLimit === maxLimit && name.length != minLimit){
        error_message = "Name is out of bounds.";
    }

    return {"isValid": error_message == null, "reason": error_message};
}

function getTeamInitials (teamName) {

    // by default take the three first letters of the team name as initials
    let initials = "";

    for (const letter of teamName){
        
        if (letter === ' '){ continue;}

        initials += letter;

        if (initials.length === 3) { break; }
    }

    return initials.toUpperCase();
}