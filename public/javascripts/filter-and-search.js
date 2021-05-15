
const TYPE_CHECKBOX_CLASS = ".typeCheckBox";
const FILTER_SEARCH_ID = "#searchTable";

$(function () {

    // filter by type
    $(TYPE_CHECKBOX_CLASS).change(function() {

        const workItemTypes = $(`${TYPE_CHECKBOX_CLASS}:checked`);

        if (workItemTypes.length == 0){
            filterBy()
            return;
        }

        const filterWorkItem = []
        
        for (let i = 0; i < workItemTypes.length; i++) {
            filterWorkItem.push(workItemTypes[i].value);
        }

        filterBy("type", filterWorkItem);
        // console.log(filterWorkItem)
        // console.log(this.checked);
        // // this will contain a reference to the checkbox   
        // if (this.checked) {
        //     // the checkbox is now checked 
        //     console.log(this.textContent)
        // } else {
        //     // the checkbox is now no longer checked
        // }
    });

    // filter by search
    $(FILTER_SEARCH_ID).keyup( function(){
        alert("here");
        filterBy();
    })

});

/**
 * Filter table by filtering by column name and value input by the user
 * @param {String} columnName 
 */
function filterBy(columnName="title", inputElement=null) {

    let searchInput;
    if (!inputElement){
        // get the input and convert it to lowercase 
        searchInput = document.getElementById("searchTable").value.toLowerCase();
    }else{
        searchInput = inputElement.join("").toLowerCase();
    }
    
    // get the table element
    let table = document.getElementById("workItemTable");

    // get all row for the table
    const tableRow = table.getElementsByTagName("tr");
    // console.log(tableRow.length);
    
    const headers = getTableHeaders(tableRow[0]);
    const columnIndx = headers.indexOf(columnName);

    // start looting at the element 1 since the 0 is the table header
    for (let i = 1; i < tableRow.length; i++) {

        // td = tr[i].getElementsByTagName("td")[0];
        td = tableRow[i].getElementsByTagName("td")[columnIndx];
        // console.log(tableRow[i]);
        // console.log(td)
        // break;
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(searchInput) > -1) {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "none";
            }
        }
    }
}

/**
 * 
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