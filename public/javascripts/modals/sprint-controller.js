/**
 * Control the logic for the date-picker
*/

const UPDATE_SPRINT_ID = "#update-sprint-id";
const UPDATE_SPRINT_NAME = ".update-sprint-name";
const UPDATE_SPRINT_BTN_SUBMIT = "#update-sprint-btn-submit";
const UPDATE_DATE_RANGE_CONTAINER = ".update-container-date";
const UPDATE_FILTER_BY_TEAM = "#update-sprint-filter-by-team";
const TRASH_BTN_REMOVE_SPRINT = "#trashBtnManageSprint";


const DATE_RANGE_INPUT_ID = ".sprint-start-date-input";

const SPRINT_DURATION_SELECT_INPUT_ID = "#sprint-duration-input";
const CREATE_SPRINT_SUBMIT_BTN = "#create-sprint-btn-submit";
const SPRINT_NAME_INPUT = "#sprint-name-input";

// create sprint spans
const SPRINT_NAME_SPAN_ERROR = "#sprint-name-span-error";
const SPRINT_DATE_SPAN_ERROR = "#sprint-date-span-error";

// Delete sprints spans
const SPRINT_TEAM_SPAN_ERROR = "#remove-sprint-team-span-error";
const SPRINT_SPRINT_SPAN_ERROR = "#remove-sprint-sprint-span-error";

const OPEN_UPDATE_SPRINT_MODAL_BTN = ".btn-update-sprint-modal-open";

const CLOSE_MODAL_SPRINT_BTN = ".close-sprint-modal";

const MODAL_DELETE_SPRINT_SUBMIT_BTN = "#modal-delete-sprint-submit-btn";



$(function () {

    // getting the amount of days of the sprint - default
    const SPRINT_TIME_PERIOD_DAYS = parseInt( $(SPRINT_TIME_PERIDO_INPUT_ID).val());

    $(SPRINT_CREATE_MODAL_TEAM_INPUT).select2();
    $(SPRINT_DELETE_MODAL_SELECT_TEAM).select2();
    $(SPRINT_DELETE_MODAL_SELECT_SPRINT).select2();
    $(UPDATE_FILTER_BY_TEAM).select2();

    // Config picker
    $(DATE_RANGE_INPUT_ID).daterangepicker({
        "opens": "center",
        "startDate": moment(), // today
        "endDate": moment().add(SPRINT_TIME_PERIOD_DAYS, 'days'),
        // "minDate": moment().subtract(ONE_WEEK, 'days'), // One week later
        "maxDate": moment().add(2, 'months'), // Two months ahead
    }, function(start, end, label) {
        manageDates(start, end);
    });

    // DURATION event
    $(SPRINT_DURATION_SELECT_INPUT_ID).on("change", function (){

        let userDuration = parseInt( $(this).val() );

        let isPremadeDuration = Object.values(SPRINT_TIME_PERIOD).includes(userDuration);

        if (isPremadeDuration){
            let current_range = $(DATE_RANGE_INPUT_ID).val();
            let { startDate } = formatDates(current_range);

            let newEndDate = moment(startDate, "MM/DD/YYYY")
            .add(userDuration, "days")
            .format("MM/DD/YYYY");
           
            $(DATE_RANGE_INPUT_ID).data('daterangepicker').setStartDate(startDate);
            $(DATE_RANGE_INPUT_ID).data('daterangepicker').setEndDate(newEndDate);
        }
    });

    // SUBMIT CREATE SPRINT
    $(CREATE_SPRINT_SUBMIT_BTN).on("click", async function(){
        
        // ========= NAME ==============
        let sprintName = $(SPRINT_NAME_INPUT).val(); 

        if (!_.isString(sprintName) || _.isEmpty(sprintName) || sprintName.length < 3){
            showErrSpanMessage(SPRINT_NAME_SPAN_ERROR, "Invalid name. Length name must be > 3");
            return;
        }

        hideErrSpanMessage(SPRINT_NAME_SPAN_ERROR);

        // ============ DATE ==============
        let {startDate, endDate} = formatDates( $(DATE_RANGE_INPUT_ID).val() )
        
        if (_.isNull(startDate) || _.isNull(endDate)){
            showErrSpanMessage(SPRINT_DATE_SPAN_ERROR, "Invalid dates.");
        }

        hideErrSpanMessage(SPRINT_DATE_SPAN_ERROR);

        // ============ TEAM ================
        let teamId = $(SPRINT_CREATE_MODAL_TEAM_INPUT).val();
        
        let request_data = {
            "name": sprintName.trim(),
            "startDate": startDate, 
            "endDate": endDate, 
            "teamId": teamId
        };

        const projectId = $(PROJECT_ID).val();
        const API_LINK_CREATE_SPRINT = `/dashboard/api/${projectId}/createSprint`;

        let response_error = null;
        const response = await make_post_request(API_LINK_CREATE_SPRINT, request_data).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){
            
            $.notify(response.msg, "success");
            $(CLOSE_MODAL_SPRINT_BTN).click();

            $(SPRINT_FILTER_BY_SPRINT_SELECT).attr("disabled", false);
            updateSelectOption(SPRINT_FILTER_BY_SPRINT_SELECT, UPDATE_TYPE.DELETE, "0");   

            
            // get user best team or selected team is available
            update_html( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.ADD, 
                {"value": response.sprint._id, "text": response.sprint.name},
                UPDATE_INPUTS.SPRINT,
                { "sprint": response["sprint"]}
            );
            
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // =========== DELETE ============
    // SUBMIT REMOVE SPRINT
    $(MODAL_DELETE_SPRINT_SUBMIT_BTN).on("click", async function(){
        
        // ========= NAME ==============
        let teamId = $(SPRINT_DELETE_MODAL_SELECT_TEAM).val();
        let sprintId = $(SPRINT_DELETE_MODAL_SELECT_SPRINT).val();

        // Validating Team
        if (_.isUndefined(teamId) || teamId == "0"){
            showErrSpanMessage(SPRINT_TEAM_SPAN_ERROR, "Invalid Team is selected.");
            return;
        }
        hideErrSpanMessage(SPRINT_TEAM_SPAN_ERROR);

        // Validating Sprint
        if (_.isUndefined(sprintId) || sprintId == "0"){
            showErrSpanMessage(SPRINT_SPRINT_SPAN_ERROR, "Invalid Sprint is selected.");
            return;
        }
        hideErrSpanMessage(SPRINT_SPRINT_SPAN_ERROR);

        
        let request_data = {"sprintId": sprintId};

        const projectId = $(PROJECT_ID).val();
        const API_LINK_REMOVE_SPRINT_FROM_TEAM = `/dashboard/api/${projectId}/removeSprintForTeam/${teamId}`;

        let response_error = null;
        const response = await make_post_request(API_LINK_REMOVE_SPRINT_FROM_TEAM, request_data).catch(err => {
            response_error = err;
        });

        if (response){
            $.notify(response.msg, "success");
            $(CLOSE_MODAL_SPRINT_BTN).click();           
            // get user best team or selected team is available

            update_html( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.DELETE, 
                sprintId,
                UPDATE_INPUTS.SPRINT,
            );            
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // DELETE SPRINT TEAM SELECT
    $(SPRINT_DELETE_MODAL_SELECT_TEAM).on("change", async function(){

        let teamId = $(this).val();

        if (teamId == 0){
            $(SPRINT_DELETE_MODAL_SELECT_SPRINT).val("0");
            $(SPRINT_DELETE_MODAL_SELECT_SPRINT).attr("disabled", true);
            return;
        }
        hideErrSpanMessage(SPRINT_TEAM_SPAN_ERROR);


        // remove disable from sprints
        $(SPRINT_DELETE_MODAL_SELECT_SPRINT).attr("disabled", false);

        const projectId = $(PROJECT_ID).val();
        const API_LINK_GET_SPRINTS_FOR_TEAM = `/dashboard/api/${projectId}/getTeamSprints/${teamId}`;

        let response_error = null;
        const response = await make_get_request(API_LINK_GET_SPRINTS_FOR_TEAM).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){

            // clean select opction
            removeAllOptionsFromSelect(
                SPRINT_DELETE_MODAL_SELECT_SPRINT, 
                {"text": "Select a sprint to remove.", "value": "0"}
            );

            if (response.sprints && response.sprints.length > 0){
                for (const sprint of response.sprints) {
                    
                    // jump on unnasigned sprint
                    if (sprint["_id"] == "0"){continue;}

                    let optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;

                    updateSelectOption(
                        SPRINT_DELETE_MODAL_SELECT_SPRINT, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText}
                    );
                }
            }else{
                $.notify("Sorry, it seems this team does not have sprints yet.", "error");
            }
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // ================ UPDATE ===============
    // UPDATE MODAL BUTTON
    $(document).on("click", OPEN_UPDATE_SPRINT_MODAL_BTN, function(){
        let sprintId = $(this).attr("id");

        // udpate the hidden input
        $(UPDATE_SPRINT_ID).val(sprintId);
        
        let name        = $(`tr#${sprintId} td.values span.title`).text();
        let startDate   = $(`tr#${sprintId} td.values span.startDate`).text();
        let endDate     = $(`tr#${sprintId} td.values span.endDate`).text();

        //console.log(name, startDate, endDate);

        $(UPDATE_SPRINT_NAME).val(name);
        $(`${UPDATE_DATE_RANGE_CONTAINER} ${DATE_RANGE_INPUT_ID}`).data('daterangepicker').setStartDate(startDate);
        $(`${UPDATE_DATE_RANGE_CONTAINER} ${DATE_RANGE_INPUT_ID}`).data('daterangepicker').setEndDate(endDate);
    });

    // UPDATE SUBMIT
    $(document).on("click", UPDATE_SPRINT_BTN_SUBMIT, async function(){

        let data = {};
        let sprintId = $(UPDATE_SPRINT_ID).val();

        // current values
        let currentName         = $(`tr#${sprintId} td.values span.title`).text();
        let currentStartDate    = $(`tr#${sprintId} td.values span.startDate`).text();
        let currentEndDate      = $(`tr#${sprintId} td.values span.endDate`).text();

        // new values
        let newName              = $(UPDATE_SPRINT_NAME).val();
        let {startDate, endDate} = formatDates( $(`${UPDATE_DATE_RANGE_CONTAINER} ${DATE_RANGE_INPUT_ID}`).val() );


        // console.log(currentName, currentStartDate, currentEndDate);
        // console.log(newName, startDate, endDate);

        // updating values
        if (currentStartDate.trim() != startDate.trim()){
            data["startDate"] = startDate;
        }

        if (currentEndDate.trim() != endDate.trim()){
            data["endDate"] = endDate;
        }

        if (newName.trim() != currentName){
            data["name"] = newName;
        }

        // getting basic info for request
        let teamId      = $(UPDATE_FILTER_BY_TEAM).val();
        let projectId   = $(PROJECT_ID).val();

        // check team Id
        if (_.isUndefined(teamId) || teamId === "0"){
            $.notify("Sorry, undefined team is selected", "error");
            return;
        }

        // check project Id
        if (_.isUndefined(projectId) || _.isNull(projectId)){
            $.notify("Sorry, Cannot find the project information", "error");
            return;
        }

        // API link
        const API_LINK_UPDATE_SPRINT = `/dashboard/api/${projectId}/updateSprint/${teamId}/${sprintId}`;

        let response_error = null;
        const response = await make_post_request(API_LINK_UPDATE_SPRINT, data).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){
            
            $.notify("Sprint Updated", "success");

            $(CLOSE_MODAL_SPRINT_BTN).click();

            let sprintId = response["sprint"]["_id"];

            updateTableElement(sprintId, response["sprint"], addSprintToTable);

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // FILTER BY TEAM UPDATE SPRINT
    // TEAM Selection
    $(UPDATE_FILTER_BY_TEAM).change(async function(){
        
        const teamId = $(this).val();    
        const projectId = $(PROJECT_ID).val();

        if (!_.isString(teamId) || teamId == '0'){
            $.notify("Invalid Team", "error");
        }

        const API_LINK_GET_SPRINTS_FOR_TEAM = `/dashboard/api/${projectId}/getTeamSprints/${teamId}`;

        let response_error = null;
        const response = await make_get_request(API_LINK_GET_SPRINTS_FOR_TEAM).catch(err => {
            response_error = err;
        });

        // clean the table
        $(`${MANAGE_TABLE_ID} > tbody`).empty();

        // Success message
        if (response){


            if (response.sprints.length > 0){
                for (const sprint of response.sprints) {
                    
                    // ignore unnasigned sprint
                    if (sprint["_id"] == "0"){ continue;}

                    addSprintToTable(sprint);
                }
            }else{
                $.notify("It seems this team does not have any sprint yet.", "error");
                return;
            }

        }else{ // error messages
            $.notify(response_error.data.responseText, "error");
        }

    });

    // TRASH BTN EVENT 
    $(TRASH_BTN_REMOVE_SPRINT).on("click", async function(){
    
        let checkedElements = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        // check if not empty
        if (!_.isArray(checkedElements) || _.isEmpty(checkedElements) ){
            $.notify("Invalid sprints were selected", "error");
            return;
        }

        const projectId = $(PROJECT_ID).val();

        const data = {"sprintsIds": checkedElements};
        const API_LINK_REMOVE_SPRINTS_FROM_PROJECT = `/dashboard/api/${projectId}/deleteSprintsFromProject/`

        let response_error = undefined;
        const response = await make_post_request(API_LINK_REMOVE_SPRINTS_FROM_PROJECT, data).catch(err => {
            response_error = err;
        });

        if (response){
            removeCheckedElement();
            
            $.notify(response.msg, "success");
            
            // disable the trash button again
            enableTrashButton(false);

            for (let i = 0; i < checkedElements.length; i++) {
                let sprintId = checkedElements[i];
                update_html( 
                    $(CURRENT_PAGE_ID).val(), 
                    UPDATE_TYPE.DELETE, 
                    sprintId,
                    null
                );
            }
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });
    
});


/**
 * Change the duration select to show to the user
 * @param {Date} start - picker start date
 * @param {Date} end  - picker end date
 * @returns 
 */
function manageDates(start, end){
    
    let startDate = moment(start);
    let endDate = moment(end);

    if (startDate >= endDate){
        $.notify("Invalid date was selected", "error");
        return;
    }

    let diff = endDate.diff(startDate, "days");

    let isPremadeDuration = Object.values(SPRINT_TIME_PERIOD).includes(diff);

    if (isPremadeDuration){
        $(SPRINT_DURATION_SELECT_INPUT_ID).val(diff);
    }else{
        $(SPRINT_DURATION_SELECT_INPUT_ID).val("0");
    }
}

/**
 * return the date as startDate and endDate in an object
 * @param {String} pickerDateValue - format is dd/mm/yyyy - dd/mm/yyyy
 * @returns {Object}
 */
function formatDates(pickerDateValue){
    
    if (_.isUndefined(pickerDateValue) || 
    _.isEmpty(pickerDateValue) || 
    !pickerDateValue.includes("-")){
        return {"startDate": null, "endDate": null};
    }

    // get the dates
    let dates = pickerDateValue.split("-");

    // clean extra spaces
    dates = dates.map( each => each.trim());

    return {"startDate": dates[0], "endDate": dates[1]};
}

/**
 * Add the sprints to the table
 * @param {Object} sprint 
 * @param {number} index
 * @returns 
 */
function addSprintToTable(sprint, index=null){

    if (_.isEmpty(sprint)){
        return;
    }

    // CHECKBOX
    let td_checkbox = `
    <td class="tableCheckBoxRowElement"> 
        <label class="invisible labelcheckbox"> 
            <input type="checkbox" aria-label="table-row-checkbox" name="checkboxWorkItem[]" value="${sprint['_id']}" class="checkboxRowElement" />
        </label> 
    </td>`;

    // NAME
    let td_name = `
    <td>
        ${sprint["name"]} 
    </td>`;

    // DATES
    let td_dates = undefined;
    if (sprint["status"] == "Active"){
        td_dates = `
        <td>
            ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]} <br>
            <span class="small text-danger">${sprint["status"]}</span>
        </td>`;
    }else{
        td_dates = `
        <td>
            ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}
        </td>`;
    }

    let td_hidden = `
    <td class="d-none values"> 
        <span class="title">${sprint["name"]}</span>
        <span class="startDate">${sprint["startDate"]}</span>
        <span class="endDate">${sprint["endDate"]}</span>
    </td>`;

    // NUMBERS OF WORK ITEMS
    let td_number_workitems = `
    <td>
        ${sprint["tasks"].length}
    </td>`;

    let td_edit = `
    <td class="column-edit-team">
        <button 
            class="btn btn-warning edit-user-team-btn btn-update-sprint-modal-open"  
            data-toggle="modal" 
            id="${sprint["_id"]}"
            data-target=".update-sprint-modal">
            <i class="fas fa-user-edit"></i>
        </button>
    </td>`;


    let table_row = `
    <tr class="rowValues" id="${sprint["_id"]}">
        ${td_checkbox}
        ${td_name}
        ${td_dates}
        ${td_hidden}
        ${td_number_workitems}
        ${td_edit}
    </tr>`;

    if (index != null){

        let numberOflements = $(`${MANAGE_TABLE_ID} > tbody > tr`).length;

        if (numberOflements != index){
            $(`${MANAGE_TABLE_ID} > tbody > tr`).eq(index).before(table_row);
        }else{
            $(`${MANAGE_TABLE_ID} > tbody > tr`).eq(index -1).after(table_row);
        }
        index = null;
    }else{
        $(`${MANAGE_TABLE_ID} > tbody`).append(table_row);
    }
}