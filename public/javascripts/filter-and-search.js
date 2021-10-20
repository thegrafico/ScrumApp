const TYPE_CHECKBOX_CLASS = ".typeCheckBox";
const STATE_CHECKBOX_CLASS = ".stateCheckBox";
const USER_CHECKBOX_CLASS = ".userCheckbox"
const FILTER_SEARCH_ID = "searchTable";
const TEAM_CHECKBOX_CLASS = ".teamCheckbox";
const FILTER_GENERAL_CLASS = ".filterOptions";
const CLEAR_FILTER_BTN = ".btnClear";

const FILTER_MANAGE_TEAM_ID = "#filter-manage-team";
const MANAGE_TEAM_COLUMNS_TO_FILTER = ["name", "email"];

// CONTAINERS
const FILTER_TEAM_CONTAINER = "#filter-btn-team";
const FILTER_STATE_CONTAINER = "#filter-btn-state";
const FILTER_USER_CONTAINER = "#filter-btn-user";
const FILTER_TYPE_CONTAINER = "#filter-btn-type";

// FEEDBACK BUTTONS
const FILTER_FEEDBACK = {
    "totalNumberOfWorkItemsBtn": {style: "total-feedback", status: null}, // same as all
    "activeWorkItemsBtn": {style: "Active-feedback", status: WORK_ITEM_STATUS["Active"]},
    "reviewWorkItemsBtn": {style: "Review-feedback", status: WORK_ITEM_STATUS["Review"]},
    "completedWorkItemsBtn": {style: "Completed-feedback", status: WORK_ITEM_STATUS["Completed"]},
}

// BUTTONS
const BTN_TOTAL_WORK_ITEMS = "totalNumberOfWorkItemsBtn";
const BTN_ACTIVE_WORK_ITEMS = "activeWorkItemsBtn";
const BTN_REVIEW_WORK_ITEMS = "reviewWorkItemsBtn";
const BTN_COMPLETED_WORK_ITEMS = "completedWorkItemsBtn";

const IS_ON_STYLE = ".ON";

const FEEDBACK_WORK_ITEM_BTN = ".feedbackWorkItemBtn";


// CSS class for opacity
const opacityStyle = "addOpacity";

// Header of the table
const filterElements = {
    "title": "title", 
    "type": "type", 
    "assigned": "assigned", 
    "state": "state",
    "team": "team",
};

$(function () {

    // filter by type
    $(TYPE_CHECKBOX_CLASS).change(function() {
        filterTable();
        
        if (anyCheckboxChecked(TYPE_CHECKBOX_CLASS)){
            $(FILTER_TYPE_CONTAINER).addClass(opacityStyle);
            return;
        }
        $(FILTER_TYPE_CONTAINER).removeClass(opacityStyle);
    });

    // filter by state
    $(STATE_CHECKBOX_CLASS).change(function() {
        filterTable();

        if (anyCheckboxChecked(STATE_CHECKBOX_CLASS)){
            $(FILTER_STATE_CONTAINER).addClass(opacityStyle);
            return;
        }
        $(FILTER_STATE_CONTAINER).removeClass(opacityStyle);
    });

    // filter by user
    $(USER_CHECKBOX_CLASS).change(function() {
        filterTable();

        if (anyCheckboxChecked(USER_CHECKBOX_CLASS)){
            $(FILTER_USER_CONTAINER).addClass(opacityStyle);
            return;
        }
        $(FILTER_USER_CONTAINER).removeClass(opacityStyle);
    });

    // filter by team
    $(TEAM_CHECKBOX_CLASS).change(function() {
        filterTable();
        
        if (anyCheckboxChecked(TEAM_CHECKBOX_CLASS)){
            $(FILTER_TEAM_CONTAINER).addClass(opacityStyle);
            return;
        }
        $(FILTER_TEAM_CONTAINER).removeClass(opacityStyle);
    });

    // filter by search
    $(`#${FILTER_SEARCH_ID}`).keyup( function(){
        filterTable();
    });

    // CLEAN FILTER ELEMENTS
    $(CLEAR_FILTER_BTN).on("click", function(){
        let filterElement = $(this).attr("id");
 
        let checkboxes = $(`li.${filterElement}`).find(':checkbox');
        
        checkboxes.prop('checked', false).change();
    });

    // ================== MANAGE ROUTES FILTERS =========================
    // filtering manage routes for team
    $(FILTER_MANAGE_TEAM_ID).keyup(function (){
        let userInput = $(this).val().toLowerCase();
        
        filterManageTable(MANAGE_TABLE_ID, userInput, MANAGE_TEAM_COLUMNS_TO_FILTER);
    })

    // TODO: maybe there is a better way of not closing the filter type when clicking inside?
    $(document).on('click', FILTER_GENERAL_CLASS, function (e) {
        e.stopPropagation();
    });

    // FEEDBACK BUTTONS EVENTS
    $(document).on("click", FEEDBACK_WORK_ITEM_BTN, function(){
        
        let clickedElementId = $(this).attr("id");
        
        let styleClass = FILTER_FEEDBACK[clickedElementId]["style"];

        const clickedSelector = $(`#${clickedElementId}`);

        clickedSelector.toggleClass(styleClass);
        clickedSelector.toggleClass(IS_ON_STYLE);


        if (clickedElementId == BTN_TOTAL_WORK_ITEMS){
            let isActive = clickedSelector.hasClass(styleClass);

            // $(`#${BTN_ACTIVE_WORK_ITEMS}`).attr("disabled", isActive);
            // $(`#${BTN_REVIEW_WORK_ITEMS}`).attr("disabled", isActive);
            // $(`#${BTN_COMPLETED_WORK_ITEMS}`).attr("disabled", isActive);

            // check all work items
            $(CHECK_ALL_CHECKBOX_TABLE_ROWS).click();
            enableTrashButton(isActive);

        }else{

            let isActiveOn      = $(`#${BTN_ACTIVE_WORK_ITEMS}`).hasClass(IS_ON_STYLE);
            let isReviewOn      = $(`#${BTN_REVIEW_WORK_ITEMS}`).hasClass(IS_ON_STYLE);
            let isCompletedOn   = $(`#${BTN_COMPLETED_WORK_ITEMS}`).hasClass(IS_ON_STYLE);
            
            // console.log(isActiveOn, isReviewOn, isCompletedOn);
            let isActive = isActiveOn || isReviewOn || isCompletedOn;

            enableTrashButton(isActive);

            // disable or enable total work items feedback button
            $(`#${BTN_TOTAL_WORK_ITEMS}`).attr("disabled", isActive);

            const status = FILTER_FEEDBACK[clickedElementId]["status"];
            $(`tr.${status}`).each(function(){

                $(this).toggleClass(HIGHLIGST_CLASS);

                let isHighlited = $(this).hasClass(HIGHLIGST_CLASS);

                $(this).find(".checkboxRowElement").prop('checked', isHighlited);
                $(this).find(".checkboxRowElement").parent().toggleClass('invisible');

                // console.log($(this).find(".checkboxRowElement"));
            });
        }

    });

});

/**
 * Set the feedbackButton active or disabled
 * @param {String} selectorId 
 * @param {Boolean} addClass 
 */
function setFeedbackButton(selectorId, addClass){

    let styleClass = FILTER_FEEDBACK[selectorId]["style"];

    if (addClass){
        $(`#${selectorId}`).addClass(styleClass);
        $(`#${selectorId}`).addClass(IS_ON_STYLE);
    }else{
        $(`#${selectorId}`).removeClass(styleClass);
        $(`#${selectorId}`).removeClass(IS_ON_STYLE);
    }
}


/**
 * Filter a table by the value searched in the columns to search
 * @param {String} tableId 
 * @param {String} searchValue 
 * @param {Array} columnsToSearch 
 */
function filterManageTable(tableId, searchValue, columnsToSearch){
    // get all rows from table

    $(`${tableId} > tbody > tr`).each(function(){
        let table_row_text = $(this).text().toLowerCase().trim();

        let currentRow = $(this);

        // if the row includes the the text
        if (table_row_text.includes(searchValue)){
            currentRow.css("display", "");
        }else{
            currentRow.css("display", "none");
        }
    });
}


// TODO: create a better way of filtering -> more dynamic
/**
 * Filter table by filtering by column name and value input by the user
 * @param {String} columnName 
 */
function filterTable() {

    // get the table element
    const table = document.getElementById("workItemTable");

    // get all row for the table
    const tableRow = table.getElementsByTagName("tr");
    
    // get the headers from the table
    const headers = getTableHeaders(tableRow[0]);
    
    const searchIndex = headers.indexOf(filterElements["title"]); // search filter by title
    const typeIndex = headers.indexOf(filterElements["type"]); 
    const stateIndex = headers.indexOf(filterElements["state"]);
    const usersIndex = headers.indexOf(filterElements["assigned"]);
    
    let searchInput = getSearchInput(FILTER_SEARCH_ID);
    let activeTypeCheckbox = getCheckboxInput(TYPE_CHECKBOX_CLASS);
    let activeStateCheckbox = getCheckboxInput(STATE_CHECKBOX_CLASS);
    let activeUsersCheckbox = getCheckboxInput(USER_CHECKBOX_CLASS);

    // add team to the filter
    let teamIndex = null;
    let activeTeamCheckbox = null;
    if (headers.includes(filterElements["team"])){
        teamIndex = headers.indexOf(filterElements["team"]);
        activeTeamCheckbox = getCheckboxInput(TEAM_CHECKBOX_CLASS)
    }

    // console.log("Rows: ", tableRow.length);

    let style = "";
    // start looting at the element 1 since the 0 is the table header
    for (let i = 1; i < tableRow.length; i++) {

        // Assume all rows are available
        style = "";

        // getting the text of each column we need. COMPLETE TODO
        // td = tr[i].getElementsByTagName("td")[0];
        let td_title = tableRow[i].getElementsByTagName("td")[searchIndex];
        let td_type = tableRow[i].getElementsByTagName("td")[typeIndex];
        let td_state = tableRow[i].getElementsByTagName("td")[stateIndex];
        let td_users = tableRow[i].getElementsByTagName("td")[usersIndex];
    
        let searchTxt = td_title.textContent || td_title.innerText;
        let typeTxt = td_type.textContent || td_type.innerText;
        let stateTxt = td_state.textContent || td_state.innerText;
        let usersTxt = td_users.textContent || td_users.innerText;


        // SEARCH
        if (searchInput && !textInColumn (searchTxt, searchInput, false)){
            style = "none";
        }

        // TYPE
        if (activeTypeCheckbox && !textInColumn (typeTxt, activeTypeCheckbox)){
            style = "none";
        }

        // STATUS
        if (activeStateCheckbox && !textInColumn (stateTxt, activeStateCheckbox)){
            style = "none"
        }

        // ASSIGNED USER
        if (activeUsersCheckbox && !textInColumn (usersTxt, activeUsersCheckbox)){
            style = "none"
        }

        // TEAM
        if (teamIndex != null){
            let td_team = tableRow[i].getElementsByTagName("td")[teamIndex];
            let teamTxt = td_team.textContent || td_team.innerText;

            if (activeTeamCheckbox && !textInColumn (teamTxt, activeTeamCheckbox)){
                style = "none"
            }
        }

        tableRow[i].style.display = style;
    }
}

/**
 * Verify if the text is a substring of another text
 * @param {String} columnText 
 * @param {String} userChoise 
 * @returns {Boolean} - True if the text is in the column -> Empty count as True
 */
function textInColumn(columnText, userChoise, desactiveSearch = true){
    
    // in case the column is null or the user did not input anything
    if (!columnText || !userChoise){ return true};
    
    let textIsAvaliable;
    
    // if the user is searching from the search input
    if (desactiveSearch){
        textIsAvaliable = userChoise.toLowerCase().trim().includes(columnText.toLowerCase().trim());    
    }else{
        textIsAvaliable = columnText.toLowerCase().trim().includes(userChoise.toLowerCase().trim());    
    }
    
    return textIsAvaliable;
}

/**
 * Get the headers of the table in an array format
 * @param {Object} tableRow - html object with all table row
 */
function getTableHeaders(tableRow){
    let tableHeaders = tableRow.getElementsByTagName("th");
    let headers = [];
    if (tableHeaders){
        for(let i = 0; i < tableHeaders.length; i++){
            headers.push(tableHeaders[i].textContent.trim().toLowerCase());
        }
    }
    return headers;
}

/**
 * Get all checkbox input
 * @param {String} checkboxClass 
 */
function getCheckboxInput(checkboxClass){

    // get all checked boxes
    const activeCheckboxes = $(`${checkboxClass}:checked`);

    if (activeCheckboxes.length == 0){
        return null;
    }

    let filterWorkItem = []
    
    // get the value of each checkbox input
    for (let i = 0; i < activeCheckboxes.length; i++) {
        filterWorkItem.push(activeCheckboxes[i].value.toLowerCase());
    }
    
    return filterWorkItem.join(" ").toLowerCase();
}