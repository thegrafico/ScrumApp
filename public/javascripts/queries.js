const SELECT_CHANGE_ARROW = ".selectContainer select";
const ADD_QUERY_ROW = ".addQueryRowIcon";
const REMOVE_QUERY_ROW = ".removeQueryRowIcon";
const QUERY_CONTAINER = ".makeQueryContainer";
const RUN_QUERY_BTN = "#runQuery";

// ROW inputs values
const SELECT_FIELD_INPUT = ".selectField";
const AND_OR_INPUT = ".selectAndOr";
const OPERATOR_INPUT = ".selectOperator";
const INPUT_USER_VALUE = ".userValue";

const ERROR_BOUNCE_ANIMATION_SECONDS = 3;
const LIMIT_NUMBER_OF_ROW = 5;


$(function () {

    // convert all to select2 
    $(SELECT_CHANGE_ARROW).select2();


    // SELECT FIELD EVENT
    $(document).on("change", SELECT_FIELD_INPUT, async function(){
        console.log("HERE");
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

        let numberOfRows = $(`${QUERY_CONTAINER} .filterRow`).length;
        
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

    $(RUN_QUERY_BTN).on("click", async function(){
        console.log("Running query...");

        let queryRequest = [];

        let isValidQuery = true;

        // getting every row value
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

        console.log(!isValidQuery, queryRequest);
        // if the query is  not valid and the query request is empty
        if (!isValidQuery || _.isEmpty(queryRequest)){ return; }

        // making the request to the API
        const projectId = $(PROJECT_ID).val();
        const API_LINK_GET_QUERY = `/dashboard/api/${projectId}/getQuery`;

        let response_error = null;
        const response = await make_post_request(API_LINK_GET_QUERY, {query: queryRequest}).catch(err=> {
            response_error = err;
        });

        // // Success message
        // if (response){
        //     update_html( 
        //         $(CURRENT_PAGE_ID).val(), 
        //         UPDATE_TYPE.ADD, 
        //         response.workItem,
        //         UPDATE_INPUTS.CREATE_WORK_ITEM,
        //     );

        //     updateWorkItemFeedback();
        // }else{ // error messages
        //     $.notify(response_error.data.responseJSON.msg, "error");
        // }

    });

});

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
function addQueryRow(selector){


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
    let queryFields = '<option value="0" selected>Select Field</option>';

    for (const [key, value] of Object.entries(QUERY_FIELD)) {
        queryFields += `\n<option value="${key}">${value}</option>`;
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

    let queryOperator = '<option value="0" selected>Select Operator</option>';

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
    <div class="row filterRow">
    ${addRemoveDiv}
        ${andOrDiv}
        ${fieldDiv}
        ${operatorDiv}
        ${valueDiv}
    </div>`;

    $(QUERY_CONTAINER).append(row);

    $(SELECT_CHANGE_ARROW).select2();
}


/**
 * Show a bounce error animation in a input element
 * @param {Object} selector - Element container
 * @param {Number} seconds - number of seconds to show the animation. Default is one second
 */
function showErrorBounceAnimation(selector, seconds=1){

    // since setTimeOut works on miliseconds
    seconds = seconds * 1000;

    // change the css for the operator 
    $(selector).addClass("bounce");

    setTimeout(function() {
        //remove the class so animation can occur as many times as user triggers event, delay must be longer than the animation duration and any delay.
        $(selector).removeClass("bounce");
    }, seconds); 

}

