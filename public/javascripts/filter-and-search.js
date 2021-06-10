const TYPE_CHECKBOX_CLASS = ".typeCheckBox";
const STATE_CHECKBOX_CLASS = ".stateCheckBox";
const USER_CHECKBOX_CLASS = ".userCheckbox"
const FILTER_SEARCH_ID = "searchTable";
const FILTER_GENERAL_CLASS = ".filterOptions";

// Header of the table
const filterElements = {"title": "title", "type": "type", "assigned": "assigned", "state": "state"};

$(function () {

    // filter by type
    $(TYPE_CHECKBOX_CLASS).change(function() {
        filterTable();
    });

    // filter by state
    $(STATE_CHECKBOX_CLASS).change(function() {
        filterTable();
    });


    // filter by user
    $(USER_CHECKBOX_CLASS).change(function() {
        filterTable();
    });

    // filter by search
    $(`#${FILTER_SEARCH_ID}`).keyup( function(){
        filterTable();
    });


    // TODO: maybe there is a better way of not closing the filter type when clicking inside?
    $(document).on('click', FILTER_GENERAL_CLASS, function (e) {
        e.stopPropagation();
    });

});


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
    let activeUsersChecbox = getCheckboxInput(USER_CHECKBOX_CLASS)

    // console.log("Rows: ", tableRow.length);

    let style = ""
    // start looting at the element 1 since the 0 is the table header
    for (let i = 1; i < tableRow.length; i++) {

        // Assume all rows are available
        style = ""

        // getting the text of each column we need. COMPLETE TODO
        // td = tr[i].getElementsByTagName("td")[0];
        td_title = tableRow[i].getElementsByTagName("td")[searchIndex];
        td_type = tableRow[i].getElementsByTagName("td")[typeIndex];
        td_state = tableRow[i].getElementsByTagName("td")[stateIndex];
        td_users = tableRow[i].getElementsByTagName("td")[usersIndex];
    
        searchTxt = td_title.textContent || td_title.innerText;
        typeTxt = td_type.textContent || td_type.innerText;
        stateTxt = td_state.textContent || td_state.innerText;
        usersTxt = td_users.textContent || td_users.innerText;

        if (searchInput && !textInColumn (searchTxt, searchInput, false)){
            style = "none";
        }

        if (activeTypeCheckbox && !textInColumn (typeTxt, activeTypeCheckbox)){
            style = "none";
        }

        if (activeStateCheckbox && !textInColumn (stateTxt, activeStateCheckbox)){
            style = "none"
        }

        if (activeUsersChecbox && !textInColumn (usersTxt, activeUsersChecbox)){
            style = "none"
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

/**
 * Get the text inside the search
 * @param {String} searchId 
 */
function getSearchInput(searchId){
    return document.getElementById(searchId).value.toLowerCase();
}