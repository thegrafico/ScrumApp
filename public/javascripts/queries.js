const SELECT_CHANGE_ARROW = ".selectContainer select";
const ADD_QUERY_ROW = ".addQueryRowIcon";
const REMOVE_QUERY_ROW = ".removeQueryRowIcon";
const QUERY_CONTAINER = ".makeQueryContainer";
const QUERY_ROW = ".filterRow";
const DYNAMIC_QUERY_ROW = ".dynamicRow";
const MAIN_QUERY_ROW = "#mainRow";

// ROW inputs values
const SELECT_FIELD_INPUT = ".selectField";
const AND_OR_INPUT = ".selectAndOr";
const OPERATOR_INPUT = ".selectOperator";
const INPUT_USER_VALUE = ".userValue";

const ERROR_BOUNCE_ANIMATION_SECONDS = 3;
const LIMIT_NUMBER_OF_ROW = 5;


//Tab Buttons
const QUERY_RESULT_TAB = "#queryResultsTab";
const RUN_QUERY_BTN = "#runQuery";
const SAVE_QUERY_BTN = "#saveQueryOpenModal";
const MY_QUERIES_BTN = "#myQueries";


// SAVE QUERY MODAL
const SAVE_QUERY_MODAL = "#saveQueryModal";
const SUBMIT_SAVE_QUERY_BTN = "#saveQuery";
const QUERY_NAME_INPUT = "#queryNameInput";


// span result number
const NUMBER_OF_QUERY_RESULT = "#numberOfQueryResult";
const TELESCOPE_IMAGE_SHOW_RESULTS = ".showQueryTelscopeImage";


// Work item table container
const WORK_ITEM_TABLE_CONTAINER = "#table-container";
const MAX_SIZE_QUERY_NAME = 40;

// SHOW QUERY MODAL
const SHOW_MY_QUERIES_MODAL = "#showQueries";
const REMOVE_MY_QUERY = ".trashIconMyQueries";

// load query from my queries
const LOAD_QUERY_BTN = ".colMyQuery";

// NEW QUERY
const NEW_QUERY_BTN = "#newQuery";


$(function () {

    // convert all to select2 
    $(SELECT_CHANGE_ARROW).select2();

    // SELECT FIELD EVENT
    $(document).on("change", SELECT_FIELD_INPUT, async function(){
        const field = $(this).val();

        let valueSelector = $(this).parent().parent().parent().find(".userValue");

        $(valueSelector).val("");

        // check for default value
        if (field == UNNASIGNED_VALUE){
            $(valueSelector).attr("disabled", true);
            return;
        }

        // disabled the value element for this row
        $(valueSelector).attr("disabled", false);

        updateDataList(field, valueSelector);
    });

    // ADD QUERY ROW BTN
    $(document).on("click", ADD_QUERY_ROW, function(){

        let numberOfRows = $(`${QUERY_CONTAINER} ${QUERY_ROW}`).length;
        
        // only add the row if the limit is not reached
        if (numberOfRows <= LIMIT_NUMBER_OF_ROW){
            addQueryRow(this);
        }else{
            $.notify("Sorry, the limit number of rows have been reached.", "error");
        }

    });

    // REMOVE QUERY ROW BTN
    $(document).on("click", REMOVE_QUERY_ROW, function(){
        removeQueryRow(this);
    });

    // RUN QUERY
    $(RUN_QUERY_BTN).on("click", async function(){
        console.log("Running query...");

        let {query, isValidQuery} = getQuery();

        // if the query is  not valid and the query request is empty
        if (!isValidQuery || _.isEmpty(query)){ 
            $.notify("Invalid the query.", "error");
            return;
        }

        // making the request to the API
        const projectId =getProjectId();
        const API_LINK_GET_QUERY = `/dashboard/api/${projectId}/getWorkItemsByQuery`;

        let response_error = null;
        const response = await make_post_request(API_LINK_GET_QUERY, {"query": query}).catch(err=> {
            response_error = err;
        });

        // Success message
        if (response){

            if (_.isEmpty(response["workItems"])){
                $.notify("There is not work item that match the query.", "error");

                // hide the work item table
                $(WORK_ITEM_TABLE_CONTAINER).addClass("d-none");

                // clean the table
                cleanTable(WORK_ITEM_TABLE);

                // show the telescope image
                $(TELESCOPE_IMAGE_SHOW_RESULTS).removeClass("d-none");
                return;
            }

            // hide telescope image from results
            $(TELESCOPE_IMAGE_SHOW_RESULTS).addClass("d-none");

            // add all work items to table
            appendToWotkItemTable(response["workItems"]);

            // show the table
            $(WORK_ITEM_TABLE_CONTAINER).removeClass("d-none");


            const numberOfWorkItemsFound = response["workItems"].length;

            // show a notify messages above the results tab
            let msg = (numberOfWorkItemsFound > 1) ? `${numberOfWorkItemsFound} Work Items found.`: "One Work Item found.";
            showPopupMessage(QUERY_RESULT_TAB, msg, "success", "top");


            // show number of work item in the results tab
            if (numberOfWorkItemsFound > 50){
                $(NUMBER_OF_QUERY_RESULT).text("50+");
            }else{
                $(NUMBER_OF_QUERY_RESULT).text(numberOfWorkItemsFound);
            }
            $(NUMBER_OF_QUERY_RESULT).removeClass("d-none");

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // Save Query
    $(SUBMIT_SAVE_QUERY_BTN).on("click", async function(){
        console.log("Saving query...");

        let {query, isValidQuery} = getQuery();

        if (!isValidQuery || _.isEmpty(query)){
            $.notify("Sorry, This query may have a problem and cannot be saved.");
            return;
        }

        const queryName = $(QUERY_NAME_INPUT).val().trim();

        if (_.isEmpty(queryName)){
            $.notify("Sorry, Query cannot be saved without a name.");
            return;
        }else if(queryName.length > MAX_SIZE_QUERY_NAME){
            $.notify("Sorry, Name for the query is to long.");
            return;
        }

        // making the request to the API
        const projectId = getProjectId();
        const API_LINK_SAVE_QUERY = `/dashboard/api/${projectId}/saveQuery`;

        let response_error = null;
        const response = await make_post_request(API_LINK_SAVE_QUERY, {"query": query, "name": queryName}).catch(err=> {
            response_error = err;
        });

        if (!response_error && response){
            $.notify(response.msg, "success");
            console.log(response);

            $(`${SAVE_QUERY_MODAL} .close`).click();

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // LOAD QUERY
    $(document).on("click", LOAD_QUERY_BTN, async function(){
        const queryId = $(this).parent().attr("id");

        if (_.isUndefined(queryId) || _.isNull(queryId) || !_.isString(queryId) || _.isEmpty(queryId)) {
            $.notify("Sorry, This query cannot be loaded at this moment.");
            return;
        }

        // making the request to the API
        const projectId = getProjectId();
        const API_LINK_GET_QUERY = `/dashboard/api/${projectId}/getQuery?queryId=${queryId}`;

        let response_error = null;
        const response = await make_get_request(API_LINK_GET_QUERY).catch(err=> {
            response_error = err;
        });

        if (!response_error && response){
            // $.notify(response.msg, "success");
            console.log(response["query"]);
            
            // check if empty
            if (_.isEmpty(response["query"])){
                $.notify("Query was found, but it seems that it's empty.", "success");
                return;
            }

            // add the rows in the UI.
            let amoundOfQueries = response["query"].length;

            cleanUserQuery((amoundOfQueries === 1));

            // start at 1 couse the first row is never deleted from the ui
            // so we just need to add the other rows for the remaining data
            for (let i = 1; i < amoundOfQueries; i++){
                addQueryRow();
            }
            
            // populate the query row after is created
            $(QUERY_ROW).each(function(index){

                // close if index is more than the amount of values available
                if (index >= amoundOfQueries) { return;}
               
                let currentRow = this;

                // only add the and/or if the index is not the 0
                if (index > 0){
                    $(currentRow).find(AND_OR_INPUT).val(response["query"][index]["andOr"]).change();
                }

                // FIELD
                $(currentRow).find(SELECT_FIELD_INPUT).val(response["query"][index]["field"]).change();
                
                // Operator
                $(currentRow).find(OPERATOR_INPUT).val(response["query"][index]["operator"]).change();
                
                // Value
                $(currentRow).find(INPUT_USER_VALUE).val(response["query"][index]["value"]);

            });
        
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

        // close the modal
        $(`${SHOW_MY_QUERIES_MODAL} .close`).click();

    });

    // clean the query
    $(NEW_QUERY_BTN).on("click", function(){
        cleanUserQuery(true);
    });

    // Opening Save query modal
    $(SAVE_QUERY_MODAL).on("shown.bs.modal", function(){
        // focus on the input element when the user opens the modal
        $(QUERY_NAME_INPUT).focus();
    });
    
    // REMOVE QUERY FROM MY QUERIES
    $(document).on("click", REMOVE_MY_QUERY, async function(){
        const queryId = $(this).parent().parent().attr("id");

        // check queryId
        if (_.isUndefined(queryId) || _.isNull(queryId) || !_.isString(queryId) || _.isEmpty(queryId)) {
            $.notify("Sorry, This query cannot be found at this moment.");
            return;
        }

        // making the request to the API
        const projectId = getProjectId();
        const API_LINK_REMOVE_QUERY = `/dashboard/api/${projectId}/removeMyQuery`;

        let response_error = null;
        const response = await make_post_request(API_LINK_REMOVE_QUERY, {queryId: queryId}).catch(err=> {
            response_error = err;
        });

        if (!response_error && response){
            $.notify(response["msg"], "success");

            // remove the current element
            $(this).parent().parent().remove();
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // Show results tab
    $(QUERY_RESULT_TAB).on("click", function(){
        $(NUMBER_OF_QUERY_RESULT).text("");
        $(NUMBER_OF_QUERY_RESULT).addClass("d-none");
    });

});

/**
 * Reset the query to the initial state
 * @param {Boolean} addDefaultQueries 
 */
function cleanUserQuery(addDefaultQueries = true){

    // remove all queries when the user loads the query
    $(DYNAMIC_QUERY_ROW).remove();

    // FIELD
    $(MAIN_QUERY_ROW).find(SELECT_FIELD_INPUT).val(UNNASIGNED_VALUE).change();
    
    // // Operator
    $(MAIN_QUERY_ROW).find(OPERATOR_INPUT).val(UNNASIGNED_VALUE).change();
    
    // Value
    $(MAIN_QUERY_ROW).find(INPUT_USER_VALUE).val("").change();

    if (addDefaultQueries){
        addQueryRow();
    }
}

function getQuery(){

    let queryRequest = [];
    let isValidQuery = true;

    // getting every row value for the query
    $(`${QUERY_CONTAINER} .filterRow`).each(function(){

        let andOr = $(this).find(AND_OR_INPUT).val();
        let field = $(this).find(SELECT_FIELD_INPUT).val();
        let operator = $(this).find(OPERATOR_INPUT).val();
        let value = $(this).find(INPUT_USER_VALUE).val();

        // only add to the query request if field is available
        if (field != UNNASIGNED_VALUE){

            // checking each value if field is available
            if (operator == UNNASIGNED_VALUE){
                console.log("Operator is empty");
                showErrorBounceAnimation($(this).find(OPERATOR_INPUT).parent(), ERROR_BOUNCE_ANIMATION_SECONDS);
                isValidQuery = false;
            }

            // checking value if not empty
            if (_.isEmpty(value)){
                console.log("Value is empty");
                showErrorBounceAnimation($(this).find(INPUT_USER_VALUE).parent(), ERROR_BOUNCE_ANIMATION_SECONDS);
                isValidQuery = false;
            }

            // adding data to request
            queryRequest.push({
                "andOr": andOr,
                "field": field,
                "operator": operator,
                "value": value,
            });
        }
    });

    return {query: queryRequest, isValidQuery};
}

/**
 * update the data field element for the value of the row
 * @param {String} field - Field to update
 */
function updateDataList(field, selector){

    const dataListInput = $(selector).attr("id");
    const DATALIST = `#${dataListInput}-datalist`;
    const FIELDS = arrayToObject(Object.keys(QUERY_FIELD));
    // clean the datalist
    $(DATALIST).empty();
    $(`#${dataListInput}`).attr("list", '');

    switch (field) {
        case FIELDS["ASSIGNED_USER"]:

            if (users){
                for (let user of users){
                    $(DATALIST).append(`<option value="${user["name"]}" id="${user["id"]}">`);
                }
            }
            break;
        case FIELDS["WORK_ITEM_STATUS"]:
            // adding special value
            $(DATALIST).append(`<option value="${QUERY_SPECIAL_VALUE}">`);
            for (let status of Object.keys(WORK_ITEM_STATUS)){
                $(DATALIST).append(`<option value="${status}">`);
            }

            break;
        case FIELDS["TEAM"]:
            if (teams){
                for (let team of teams){
                    $(DATALIST).append(`<option value="${team["name"]}" id="${team["_id"]}">`);
                }
            }
            break;
        case FIELDS["WORK_ITEM_TYPE"]:
            $(DATALIST).append(`<option value="${QUERY_SPECIAL_VALUE}">`);
            for (let type of Object.keys(WORK_ITEM_ICONS)){
                $(DATALIST).append(`<option value="${type}">`);
            }
            break;
        case FIELDS["SPRINT_STATUS"]:
            for (let status of Object.keys(SPRINT_STATUS)){
                $(DATALIST).append(`<option value="${status}">`);
            }
            break;
        case FIELDS["PRIORITY_POINTS"]:
            $(DATALIST).append(`<option value="${QUERY_SPECIAL_VALUE}">`);
            for (let key of Object.keys(PRIORITY_POINTS)){
                $(DATALIST).append(`<option value="${key} - ${PRIORITY_POINTS[key]}">`);
            }
            break;
        case FIELDS["WORK_ITEM_CREATION"]:
        case FIELDS["SPRINT_START_DATE"]:
        case FIELDS["SPRINT_END_DATE"]:
            let today = moment(new Date()).format(SPRINT_FORMAT_DATE);
            let lastWeek = moment(new Date()).subtract(ONE_WEEK, "days").format(SPRINT_FORMAT_DATE);
            let lastTwoWeek = moment(new Date()).subtract(ONE_WEEK * 2, "days").format(SPRINT_FORMAT_DATE);

            let dates = [today, lastWeek, lastTwoWeek];
            for (let date of dates){
                $(DATALIST).append(`<option value="${date}">`);
            }
            
            break;
        default:
            console.log("updateDataList default case...");
            break;
    }

    $(`#${dataListInput}`).attr("list", `${dataListInput}-datalist`);

}

/**
 * Remove a query row taking as reference the icon clicked
 * @param {Object} selector 
 */
function removeQueryRow(selector){
    $(selector).parent().parent().parent().remove();
}

/**
 * Adding a new query row
 * @param {Object} selector 
 */
function addQueryRow(){

    let addRemoveDiv = `
    <div class="col col-1 my-auto">
        <div class="setupRowContainer">
            <i class="fas fa-plus completedColor formatIcon addQueryRowIcon"></i>
            <i class="fas fa-times blockColor formatIcon removeQueryRowIcon"></i>
        </div>
    </div>`;

    let andOrDiv = `
    <div class="col col-1" >
        <div class="selectContainer">
            <select class="custom-select my-custon-select selectAndOr">
                <option value="${QUERY_LOGICAL_CONDITION["AND"]}">${QUERY_LOGICAL_CONDITION["AND"]}</option>
                <option value="${QUERY_LOGICAL_CONDITION["OR"]}">${QUERY_LOGICAL_CONDITION["OR"]}</option>
            </select>
        </div>
    </div>`;


    // ====================== QUERY FIELDS ======================
    let queryFields = `<option value="${UNNASIGNED_VALUE}" selected>Select Field</option>`;

    for (const [key, value] of Object.entries(QUERY_FIELD)) {
        queryFields += `\n<option value="${key}">${value["text"]}</option>`;
    }
    let fieldDiv = `
    <div class="col col-3">
        <div class="selectContainer">
            <select class="custom-select my-custon-select selectField">
               ${queryFields}
            </select>
        </div>
    </div>`;
    // ======================== Query OPERATOR ===================

    let queryOperator = `<option value="${UNNASIGNED_VALUE}" selected>Select Operator</option>`;

    for (const [key, value] of Object.entries(QUERY_OPERATOR)) {
        queryOperator += `\n<option value="${key}">${value}</option>`;
    }

    let operatorDiv = `
    <div class="col col-2">
        <div class="selectContainer">
            <select class="custom-select my-custon-select selectOperator">
              ${queryOperator}
            </select>
        </div>
    </div>`;

    // ====================== Value =====================
    let dataListId = getRandomString(5);
    let valueDiv = `
    <div class="col col-4">
        <div class="selectContainer">
            <input class="custom-select my-custon-select userValue" list="row-${dataListId}-datalist" name="dt-${dataListId}" id="row-${dataListId}" placeholder="Insert Value" disabled>
            <datalist id="row-${dataListId}-datalist">
            </datalist>
            <i class="fas fa-chevron-down formatIcon"></i>
        </div>
    </div>`;

    let row = `
    <div class="row filterRow dynamicRow">
        ${addRemoveDiv}
        ${andOrDiv}
        ${fieldDiv}
        ${operatorDiv}
        ${valueDiv}
    </div>`;

    $(QUERY_CONTAINER).append(row);

    $(SELECT_CHANGE_ARROW).select2();
}

