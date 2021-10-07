const NEW_KEY_DATA = "formatedDate";

// FILTERS
const FILTE_BY_TEAM_SPRINT_REVIEW = "#filter-by-team-sprint-review";
const FILTE_BY_SPRINT_REVIEW = "#filter-by-sprint-review";

// CHARTS
const BURN_DOWM_CHART_CONTAINER = "burndownChart";
// const DONUT_CHART_CONTAINER = "donutChart";
const BREAKDOWN_CHART_CONTAINER = "typeBreakdownChart";

// BURNDOWN 
const NUMBER_OF_WORK_ITEMS = "#numberOfWorkItems";
const DAYS_DURATION = "#durationDays";
const TOTAL_POINTS = "#totalPoints";

// DATES
const START_DATE = "#sprintStartDate";
const END_DATE = "#sprintEndDate";

// STATUS REPORT
const COMPLETED_STORY_POINTS = "#completedStoryPoints";
const INCOMPLETED_STORY_POINTS = "#incompletedStoryPoitns";
const CAPACITY_FOR_SPRINT = "#sprintCapacity";
const DURATION_SPRINT = "#sprintDuration";
const INITAL_POINTS = "#initalPoints";
const IS_FUTURE_SPRINT = "#isFutureSprint";

const REVIEW_CONTAINER = "#plots-container";
const DATE_LABEL_FORMAT = "DD MMM";

const STATUS_REPORT_DATA_CONTAINER = ".statusReportDataContainer";
const GO_TO_SPRINT_LINK = "#goToSprintLink";

// Buttons
const BTN_REVIEW_COMPLETED_STORY_POINTS = "#review-completed-story-points";
const BTN_REVIEW_INCOMPLETED_STORY_POINTS = "#review-incompleted-story-points";
const BTN_REVIEW_CAPACITY = "#review-capacity";

// MODAL
const MODAL_REVIEW_WORK_ITEMS = "#review-work-items";
const BTN_CLOSE_REVIEW_MODAL = ".close-review-modal";
const MODAL_TITLE_REVIEW_WORK_ITEMS = "#title-review-work-items";

// CLOSE ACTIVE SPRINT
const OPEN_CLOSE_SPRINT_BTN = "#close-sprint-btn";
const CLOSE_SPRINT_CONFIRMATION_MODAL = "#close-sprint-confirmation-modal";
const CURRENT_ACTIVE_SPRINT = "#current-active-sprint-input";
const NEW_ACTIVE_SPRINT_SELECT = "#new-active-sprint";
const NEW_ACTIVE_SPRINT_CAPACITY_INPUT = "#active-sprint-capacity";
const CLOSE_SPRINT_SUBMIT_BTN = "#close-sprint-submit-btn";
const CLOSE_SPRINT_CONTAINER_BTN = "#close-sprint-button-container";

// STARTING A SPRINT
const START_SPRINT_MODAL = "#start-sprint-confirmation-modal"; 
const OPEN_START_SPRINT_MODAL_BTN = "#start-sprint-btn";
const START_SPRINT_MODAL_INPUT = "#start-sprint-modal-input";
const START_SPRINT_CAPACITY_INPUT = "#start-sprint-capacity";
const START_SPRINT_BTN_CONTAINER = "#start-sprint-button-container";
const START_SPRINT_SUBMIT_BTN = "#start-sprint-submit-btn";

$(function () {

    // ======= DEFAULTS =======
    $(FILTE_BY_TEAM_SPRINT_REVIEW).select2();
    $(FILTE_BY_SPRINT_REVIEW).select2();
    $(NEW_ACTIVE_SPRINT_SELECT).select2();

    // default color of the text
    Chart.defaults.color = "white";
    Chart.defaults.font.size = 16;
    // =========================

    // Work Items - This variable is declare in the ejs view. 
    workItems = formatWorkItemDates(workItems, DATE_LABEL_FORMAT);

    // ====== PLOTS ======
    let burnChart = burndownChart(pointsHistory, DATE_LABEL_FORMAT);
    let barchart = breakDownChart(workItems);

    // ======== Run when page is loaded ========
    checkIsFutureSprint();
    
    // ============= FILTERS ============================

    // FILTER BY TEAM
    $(FILTE_BY_TEAM_SPRINT_REVIEW).on("change", async function(){
        const projectId = getProjectId();

        const teamId = $(this).val();

        const API_LINK_GET_SPRINT_REVIEW_BY_TEAM = `/dashboard/api/${projectId}/getSprintReview/${teamId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_SPRINT_REVIEW_BY_TEAM).catch(err=> {
            response_error = err;
        });
    
        // clean the sprint options for the new team
        removeAllOptionsFromSelect(FILTE_BY_SPRINT_REVIEW, null);
        cleanTable(WORK_ITEM_TABLE);

        // change the select on the work item
        updateSelectOption(WORK_ITEM["team"], UPDATE_TYPE.CHANGE, teamId);
        removeAllOptionsFromSelect(WORK_ITEM["sprint"], {"text": "Not sprint found", "value": UNNASIGNED_VALUE});

        // remove all sprints options for the select to close the sprint
        removeAllOptionsFromSelect(NEW_ACTIVE_SPRINT_SELECT, {"text": "Select a sprint.", "value": UNNASIGNED_VALUE});

        if (!response_error){
            
            // Check work items
            updateReviewPage(response.workItems, response["statusReport"], burnChart, barchart);

            // Check sprint
            if (response.sprints.length > 0){
                
                // update the select option
                for (const sprint of response.sprints) {    
                    let isSelected = sprint["_id"].toString() == response["activeSprint"].toString();
                    
                    let optionText = formatSprintText(sprint, isSelected);

                    // add the options to the sprint (Filter)
                    updateSelectOption(
                        FILTE_BY_SPRINT_REVIEW, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected,
                        {"name": sprint["name"], "sdate": sprint["startDate"], "edate": sprint["endDate"]}
                    );

                    // add the options to the sprint (For Closing sprint)
                    updateSelectOption(
                        NEW_ACTIVE_SPRINT_SELECT, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        false // make it default so the user needs to select a new sprint to be active
                    );

                    // feedback message in case the active sprint is a past sprint
                    if (isSelected && sprint["status"] != SPRINT_STATUS["Active"]){
                        let message = `This is a ${sprint["status"]} sprint.`;
                        showPopupMessage(FILTE_BY_SPRINT_REVIEW, message, "error", "top");
                    }
                }
            }else{ 
                showPopupMessage(FILTE_BY_SPRINT_REVIEW, "Not Sprint found");
            }

            // show the close sprint button if the sprint is the active sprint at the moment
            showCloseSprintButton(response["statusReport"]["isActiveSprint"]);

            // show the start sprint button is the current sprint is a future sprint and is not active yet.
            showStartSprintButton(response["statusReport"]["isFutureSprint"],response["statusReport"]["isActiveSprint"]);

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        } 
    });

    // FILTER BY SPRINT
    $(document).on("change", FILTE_BY_SPRINT_REVIEW, async function(){

        $(STATUS_REPORT_DATA_CONTAINER).remove();

        const sprintId = $(this).val();

        const {response, response_error} = await getSprintReview(sprintId, FILTE_BY_TEAM_SPRINT_REVIEW);
        
        if (!response_error){

            // show the close sprint button if the sprint is the active sprint at the moment
            showCloseSprintButton(response["statusReport"]["isActiveSprint"]);

            // show the start sprint button is the current sprint is a future sprint and is not active yet.
            showStartSprintButton(response["statusReport"]["isFutureSprint"],response["statusReport"]["isActiveSprint"]);

            updateReviewPage(response.workItems, response["statusReport"], burnChart, barchart);
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // ============= REVIEW BUTTONS ================ 

    // COMPLETED STORY POINTS
    $(BTN_REVIEW_COMPLETED_STORY_POINTS).on("click", function(){
        
        let showCompleted = true;
        filterWorkItemTableForReview(showCompleted);
    });

    // INCOMPLETED STORY POINTS
    $(BTN_REVIEW_INCOMPLETED_STORY_POINTS).on("click", function(){

        let showCompleted = false;
        filterWorkItemTableForReview(showCompleted);
    });

    // Close the modal
    $(BTN_CLOSE_REVIEW_MODAL).on("click", function(){
        $(MODAL_REVIEW_WORK_ITEMS).modal("hide");
    });

    // =================== START SPRINT ========================
    $(OPEN_START_SPRINT_MODAL_BTN).on("click", function(){

        // update the name of the sprint to be close
        let sprintName = $(`${FILTE_BY_SPRINT_REVIEW} option:selected`).attr("data-name");
        $(START_SPRINT_MODAL_INPUT).val(sprintName);

        let capacity = $(CAPACITY_FOR_SPRINT).text().trim();

        $(START_SPRINT_CAPACITY_INPUT).val(capacity);
    });

    // When the user submit the start sprint
    $(START_SPRINT_SUBMIT_BTN).on("click", async function(){

        // Getting the closing sprint id
        const startSprint = $(FILTE_BY_SPRINT_REVIEW).val();
        const newCapacity = $(START_SPRINT_CAPACITY_INPUT).val().trim();
        const teamId = $(FILTE_BY_TEAM_SPRINT_REVIEW).val();

        // check the sprint is not empty
        if (!_.isString(startSprint) || _.isEmpty(startSprint)){
            $.notify("Oops, There was a problem, please refresh the page.", "error");
            return;
        }

        // check capacity is a number
        if (!_.isString(newCapacity) || _.isEmpty(newCapacity) || isNaN(newCapacity)){
            $.notify("Sorry, Only numbers are allowed for the sprint capacity", "error");
            return;
        }

        // check is sprint is UNNASIGNED_VALUE 
        if (startSprint == UNNASIGNED_VALUE){
            $.notify("Sprint is not selected", "error");
            return;
        }

        // check team
        if (!_.isString(teamId) || teamId == UNNASIGNED_VALUE){
            $.notify("Invalid Team is selected", "error");
            return;    
        }


        // make the request
        const projectId = getProjectId();
        const API_LINK_START_NEW_SPRINT = `/dashboard/api/${projectId}/startSprint/${teamId}`;
        let data = {"sprint": startSprint, "capacity": newCapacity};

        let response_error = null;
        let response = await make_post_request(API_LINK_START_NEW_SPRINT, data).catch(err=> {
            response_error = err;
        });

        // check the request
        if (!response_error){
            $.notify(response["msg"], "success");

            // hide the start sprint button
            showStartSprintButton(false, false);

            // show the close sprint button
            showCloseSprintButton(true);

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

    // =================== CLOSE SPRINT ========================

    // when modal is click to be open
    $(OPEN_CLOSE_SPRINT_BTN).on("click", function(){

        let sprintId = $(FILTE_BY_SPRINT_REVIEW).val();

        // update the name of the sprint to be close
        let sprintName = $(`${FILTE_BY_SPRINT_REVIEW} option:selected`).attr("data-name");
        $(CURRENT_ACTIVE_SPRINT).val(sprintName);

        // remove previus disabled elements if any
        removeDisabledFromSelectOption(NEW_ACTIVE_SPRINT_SELECT);

        // from the sprints available, disabled the sprint to be close
        setDisableAttrToSelectOption(NEW_ACTIVE_SPRINT_SELECT, sprintId, true);
    });

    // When user changes the sprint to be active
    $(NEW_ACTIVE_SPRINT_SELECT).on("change", async function(){

        let selectedSprintStartDate = $(`${NEW_ACTIVE_SPRINT_SELECT} option:selected`).attr("data-sdate");
        let closingSprintStartDate = $(`${FILTE_BY_SPRINT_REVIEW} option:selected`).attr("data-sdate");

        selectedSprintStartDate = moment(selectedSprintStartDate, SPRINT_FORMAT_DATE);
        closingSprintStartDate = moment(closingSprintStartDate, SPRINT_FORMAT_DATE);

        // if the start date of the selected sprint is before than the date of the closing sprint, show a message to the user
        if (selectedSprintStartDate.isBefore(closingSprintStartDate)){
            let msg = "This sprint start date is before than the current sprint.";
            showPopupMessage(NEW_ACTIVE_SPRINT_SELECT, msg, "error", "top-left", 5);
        }

        // get sprint current capacity if any
        const sprintId = $(this).val();
        const teamId = $(FILTE_BY_TEAM_SPRINT_REVIEW).val();
        const projectId = getProjectId();

        if (sprintId == UNNASIGNED_VALUE){
            // active the disabled attr. 
            $(NEW_ACTIVE_SPRINT_CAPACITY_INPUT).attr("disabled", true);
            $(NEW_ACTIVE_SPRINT_CAPACITY_INPUT).val(0);
            return;
        }

        // remove disable atrr
        $(NEW_ACTIVE_SPRINT_CAPACITY_INPUT).attr("disabled", false);

        if (!_.isString(sprintId) || !_.isString(teamId) || !_.isString(projectId)){
            $.notify("Sorry, There is a problem getting information to make the request. Please refresh the page.");
            return;
        }

        const API_LINK_GET_SPRINT_CAPACITY = `/dashboard/api/${projectId}/getSprintReview/${teamId}/${sprintId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_SPRINT_CAPACITY).catch(err=> {
            response_error = err;
        });

        if (!response_error){
            let capacityOfSprintToBeActive = response["statusReport"]["capacity"];

            // update capacity points
            $(NEW_ACTIVE_SPRINT_CAPACITY_INPUT).val(capacityOfSprintToBeActive);
        }else{
            $(NEW_ACTIVE_SPRINT_CAPACITY_INPUT).val(0);
        }
    });

    // CLOSE SPRINT SUBMIT BTN
    $(CLOSE_SPRINT_SUBMIT_BTN).on("click", async function(){

        // Getting the closing sprint id
        const closingSprintId = $(FILTE_BY_SPRINT_REVIEW).val();
        const newActiveSprintId = $(NEW_ACTIVE_SPRINT_SELECT).val();
        const newActiveSprintCapacity = $(NEW_ACTIVE_SPRINT_CAPACITY_INPUT).val();


        if (_.isUndefined(closingSprintId) || _.isEmpty(closingSprintId)){
            $.notify("Sorry, there is not closing sprint selected", "error");
            return;
        }

        if (_.isUndefined(newActiveSprintId) || _.isEmpty(newActiveSprintId)){
            $.notify("Sorry, there was a problem getting the new active sprint information", "error");
            return;
        }

        if (newActiveSprintId == UNNASIGNED_VALUE){
            $.notify("Active Sprint not selected", "error");
            return;
        }

        if (_.isEmpty(newActiveSprintCapacity) || isNaN(newActiveSprintCapacity)){
            $.notify("Please make sure the sprint capacity is a number and not empty.", "error");
            return;
        }

        const projectId = getProjectId();
        const API_LINK_CLOSE_SPRINT = `/dashboard/api/${projectId}/closeSprint/`;
        let data = {"closingSprint": closingSprintId, "activeSprint": newActiveSprintId, "sprintCapacity": newActiveSprintCapacity};

        let response_error = null;
        let response = await make_post_request(API_LINK_CLOSE_SPRINT, data).catch(err=> {
            response_error = err;
        });

        if (!response_error){
            $.notify(response["msg"], "success");

            // since we closed this sprint, hide the close sprint button
            showCloseSprintButton(false, false);

            // check if this sprint that we closed is a possible future sprint
            // false by default because we know this is not an active sprint. 
            showStartSprintButton(response["isFutureSprint"], false);

            // remove previus disabled elements if any
            removeDisabledFromSelectOption(NEW_ACTIVE_SPRINT_SELECT);

            // from the sprints available, disabled the sprint to be close
            setDisableAttrToSelectOption(NEW_ACTIVE_SPRINT_SELECT, newActiveSprintId, true);
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }

    });

});

/**
 * Update sprint review page overall UI
 * @param {Array} workItems 
 * @param {Object} statusReport 
 * @param {ChartJs} burnChart 
 * @param {ChartJs} barchart 
 */
function updateReviewPage(workItems, statusReport, burnChart, barchart){
    
    // hiding elements
    $(GO_TO_SPRINT_LINK).removeClass("d-none");
    $(REVIEW_CONTAINER).removeClass("d-none");

    let completedText = `${statusReport["completedPoints"]}/${statusReport["totalPoints"]}`;
    let incompletedText = `${statusReport["incompletedPoints"]}/${statusReport["totalPoints"]}`;
    let capacityText = statusReport["capacity"];
    let durationText = `${statusReport["numberOfDays"]} days`;

    $(COMPLETED_STORY_POINTS).text(completedText);
    $(INCOMPLETED_STORY_POINTS).text(incompletedText);
    $(CAPACITY_FOR_SPRINT).text(capacityText);
    $(DURATION_SPRINT).text(durationText);

    updateBurnDownChart(burnChart, statusReport);
    updateBreakdownChart(barchart, workItems);

    // Update status report data for work items
    appendToWotkItemTable(workItems);
}

/**
 * Filter the work items to show only the completed or not completed elements
 * @param {Boolean} showCompleted 
 */
function filterWorkItemTableForReview(showCompleted){

    let atLeastOneIsShow = false;
    let title = (showCompleted) ? "Work Items completed" : "Work Items Not completed";

    $(".rowValues").each(function(i){

        let temp = (showCompleted) ? !$(this).hasClass("Completed") : $(this).hasClass("Completed");
       
        if (temp){
            $(this).addClass("d-none");
        }else{ // is completed
            $(this).removeClass("d-none");
            atLeastOneIsShow = true;
        }
        
    });

    if (atLeastOneIsShow){
        $(MODAL_TITLE_REVIEW_WORK_ITEMS).text(title);
        $(MODAL_REVIEW_WORK_ITEMS).modal("show");
    }else{
        $.notify("Sorry, There is not information to show.");
    }

}


/**
 * Update the burndownChart 
 * @param {ChartJs} burnDownChart - burndownChart 
 * @param {Array} workItems - work items 
 * @param {Object} statusReport - Status report data
 */
function updateBurnDownChart(burnDownChart, statusReport){

    // Work Items - This variable is declare in the ejs view. 
    let pointsHistory = statusReport["pointsHistory"];

    // getting range dates for the sprint
    let startDate = statusReport["startDate"];
    let endDate = statusReport["endDate"];

    // getting total points of the sprint
    let totalPoints = statusReport["initalSprintPoints"];

    // getting dates between the sprint in desired format
    const dates = getDaysBetween(startDate, endDate, DATE_LABEL_FORMAT);

    // to update the plot until today
    const isTodayBetween = isDateBetween(startDate, endDate);

    // getting the guideline data 
    const guidelineData = getGuideleValues(totalPoints, dates.length -1);

    // getting the actual burndown of the sprint
    const actualBurndownData = getBurndownLineData(pointsHistory, totalPoints, dates, isTodayBetween);

    // Updating labels
    burnDownChart.data.labels = dates;

    // updating guideline
    burnDownChart.data.datasets[0].data = guidelineData;

    // updating burndown line
    burnDownChart.data.datasets[1].data = actualBurndownData;

    // update chart
    burnDownChart.update();
    
}


/**
 * get the line data for the workItems completed
 * @param {Array} workItems - array of object with work items completed
 */
function getBurndownLineData(pointsHistory, totalPoints, labelDates, isTodayBetween){

    let today = moment(new Date()).format(DATE_LABEL_FORMAT);

    let burndownData = [];

    let currentPoints = totalPoints;

    for(let i = 0; i < labelDates.length; i++){

        let date = labelDates[i];


        let pointsCompletedAtDate = pointsHistory.filter(each => {
            return moment(each["date"], SPRINT_FORMAT_DATE).format(DATE_LABEL_FORMAT) == date;
        });

        if (_.isEmpty(pointsCompletedAtDate)){

            burndownData.push(currentPoints);

            if (isTodayBetween){
                if (date === today){
                    break;
                }
            }

            continue;
        }

        // get current points
        currentPoints = pointsCompletedAtDate[0]["points"];

        burndownData.push(currentPoints);

        // break to avoid calculating future value and not ultil today values
        if (isTodayBetween){
            if (date === today){
                break;
            }
        }        
    }
    return burndownData;
}

/**
 * add a new key to the work item with the desired format. this format will be use as and index.
 * @param {Array} workItems - Array of object with the work item information.
 * @param {String} desiredFormat - new date format for the work items.
 */
function formatWorkItemDates(workItems, desiredFormat){
    
    for (let workItem of workItems){
        workItem[NEW_KEY_DATA] = moment(workItem["updatedAt"]).format(desiredFormat);
    }

    return workItems;
}

/**
 * Create burndownChart
 * @returns
 */
function burndownChart(pointsHistory, labelDateFormat){

    // getting range dates for the sprint
    let startDate = $(START_DATE).val();
    let endDate = $(END_DATE).val();

    // getting total points of the sprint
    let totalPoints = parseInt( $(INITAL_POINTS).val());

    // getting dates between the sprint in desired format
    let dates = getDaysBetween(startDate, endDate, labelDateFormat);

    // to update the plot until today
    const isTodayBetween = isDateBetween(startDate, endDate);

    // getting the guideline data 
    const guidelineData = getGuideleValues(totalPoints, dates.length -1);
    
    // getting the actual burndown of the sprint
    const actualBurndownData = getBurndownLineData(pointsHistory, totalPoints, dates, isTodayBetween);

    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Guideline',
          data: guidelineData,
          borderColor: "#3498db",
        //   backgroundColor: "#3498db",
          borderDash: [10,5]
        },
        {
          label: 'Remaining',
          data: actualBurndownData,
          borderColor: "#e74c3c",
          backgroundColor: "#e74c3c",
        }
      ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
            scales: {
                x: {
                  grid: {
                    display:true,
                    drawBorder: false,
                    color: "gray"
                  },
                  ticks: {
                    maxTicksLimit: Math.round(dates.length / 2),
                  }
                },
                y: {
                  grid: {
                        display:true,
                        drawBorder: false,
                        color: "gray"
                    },
                    beginAtZero: true,
                    title: {
                        display:true,
                        text: "Story Points",
                        font: {
                            size: 12
                        }
                    }
                }
            }
        },
    };

    let chart = getChart(config, BURN_DOWM_CHART_CONTAINER);

    return chart
}


/**
 * Create breakdownChart
 * @returns
 */
function breakDownChart(workItems){

    const labels = ["Story", "Task", "Research", "Bugs"];

    const {planed, completed} = getBreakdownTypeData(workItems); 
    const data = {
    labels: labels,
    datasets: [
        {
            label: 'Expected Points',
            data: [planed["Story"], planed["Task"], planed["Research"], planed["Bug"]],
            borderColor: [
                // "rgb(44, 129, 186)",
                // "rgb(147, 154, 161)",
                "rgb(255, 255, 255)",
                // "rgb(196, 65, 51)",
            ],
            backgroundColor: [
                // "rgba(44, 129, 186, 0.5)",
                // "rgba(147, 154, 161, 0.5)",
                "rgba(255, 255, 255, 0.5)",
                // "rgba(196, 65, 51, 0.5)",
            ],
        },
        {
            label: 'Completed',
            data: [completed["Story"], completed["Task"], completed["Research"], completed["Bug"]],
            borderColor: "rgb(0, 160, 119)",
            backgroundColor: "rgba(0, 160, 119, 0.5)",
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                x: {
                  grid: {
                    display:true,
                    drawBorder: false,
                    color: "gray"
                  },
                  title: {
                    display:true,
                    text: "Story Points",
                    font: {
                        size: 12
                    }
                }
                //   ticks: {
                //     maxTicksLimit: Math.round(dates.length / 2),
                //   }
                },
                y: {
                  grid: {
                        display:true,
                        drawBorder: false,
                        color: "gray"
                    },
                    beginAtZero: true,
                    title: {
                        display:true,
                        // text: "Types",
                        font: {
                            size: 12
                        }
                    }
                }
            },
            indexAxis: 'y',
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
                bar: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Work Item types breakdown'
                }
            }
        },
    };

    return getChart(config, BREAKDOWN_CHART_CONTAINER);
}


/**
 * Update chart data
 * @param {ChartJs} chartJs 
 * @param {Object} workItems 
 */
function updateBreakdownChart(chartJs, workItems){

    const {planed, completed} = getBreakdownTypeData(workItems); 

    const planedData = [planed["Story"], planed["Task"], planed["Research"], planed["Bug"]];
    const completedData = [completed["Story"], completed["Task"], completed["Research"], completed["Bug"]];

    // Planed
    chartJs.data.datasets[0].data = planedData;

    // Completed
    chartJs.data.datasets[1].data = completedData;

    // update chart
    chartJs.update();
}


/**
 * Get the breackdown data for the barchart
 * @param {Array} workItems - 
 * @returns 
 */
function getBreakdownTypeData(workItems){

    const notEqual = true;

    let story = workItems.filter(each => {return each["type"] === "Story"});
    let tasks = workItems.filter(each => {return each["type"] === "Task"});
    let research = workItems.filter(each => {return each["type"] === "Research"});
    let bugs = workItems.filter(each => {return each["type"] === "Bug"});

    const columnToSum = "storyPoints";

    // STORY
    let storyPointsCompleted = sumObjectValue( filterElementsByValue(story, "status", WORK_ITEM_STATUS["Completed"]), columnToSum);
    let storyPointsPlaned = sumObjectValue(story, columnToSum);

    // TASKS
    let tasksCompleted = sumObjectValue(filterElementsByValue(tasks, "status", WORK_ITEM_STATUS["Completed"]), columnToSum);
    let tasksPlaned = sumObjectValue(tasks, columnToSum);

    // RESEARCH
    let researchCompleted = sumObjectValue(filterElementsByValue(research, "status", WORK_ITEM_STATUS["Completed"]), columnToSum);
    let researchPlaned = sumObjectValue(research, columnToSum);

    // BUGS
    let bugsCompleted = sumObjectValue(filterElementsByValue(bugs, "status", WORK_ITEM_STATUS["Completed"]), columnToSum);
    let bugsPlaned = sumObjectValue(bugs, columnToSum);

    let completed = {
        "Story": storyPointsCompleted,
        "Task": tasksCompleted,
        "Research": researchCompleted,
        "Bug": bugsCompleted
    }

    let planed = {
        "Story": storyPointsPlaned,
        "Task": tasksPlaned,
        "Research": researchPlaned,
        "Bug": bugsPlaned
    }

    return {planed, completed};
}

/**
 * get the chartJs object
 * @param {Object} config 
 * @param {String} divId 
 * @returns {ChartJs}
 */
function getChart(config, divId){

    let ctx = document.getElementById(divId).getContext('2d');
    
    return new Chart(ctx, config);
}


/**
 * Get the days between two dates
 * @param {String} startDate - start date
 * @param {String} endDate - end date
 * @param {String} format - format of the date - default MM-DD-YYYY
 * @returns {Array} - Array with dates between including start and end date
 */
function getDaysBetween(startDate, endDate, newFormat, format=SPRINT_FORMAT_DATE) {
    var dates = [];
    let formatedDate = undefined;

    var currDate = moment(startDate, format).startOf('day');
    var lastDate = moment(endDate, format).startOf('day');

    formatedDate = currDate.clone().format(newFormat);
    dates.push(formatedDate);


    while(currDate.add(1, 'days').diff(lastDate) < 1) {
        formatedDate = currDate.clone().format("DD MMM");
        dates.push(formatedDate);
    }
    return dates;
};


/**
 * Get the data for the Guideline plot
 * @param {Number} totalPoints 
 * @param {Number} numberOfDays 
 * @returns {Array}
 */
function getGuideleValues(totalPoints, numberOfDays){
    
    let points = [];

    let subAmout = totalPoints / numberOfDays;

    subAmout = Math.round((subAmout + Number.EPSILON) * 100) / 100;

    let linearFunt = getLinearFunction(totalPoints, numberOfDays);

    for (let i = 0; i < numberOfDays + 1; i++) {        
        points.push(linearFunt(i));
    }

    return points;
}


/**
 * Get the linear equation between two points in params.
 * x1 = totalPoints, y2 = totalPoints, x2 and y1 are 0
 * @param {Number} totalPoints - Amount of points in the sprint
 * @param {Number} numberOfDays - number of days for the sprint
 * @returns {Function} - linear equation
 */
function getLinearFunction(totalPoints, numberOfDays){
    
    let x1 = numberOfDays;
    let x2 = 0;

    let y1 = 0;
    let y2 = totalPoints;

    // calculate m
    let m = ( y2 - y1) / (x2 - x1);

    // y = mx + b
    // we need to calculate b now
    let b = -(m * x1) + y1

    // linear function
    let f = (x) => {
        return (m * x) + b;
    }

    return f;
}


/**
 * Get the sprint information
 * @param {String} sprintId - id of the sprint
 * @returns 
 */
async function getSprintReview(sprintId, teamSelector){
    
    const projectId = getProjectId();
    const teamId = $(teamSelector).val();

    // update the "got to sprint" link
    let newLinkOpenSprint = `/dashboard/${projectId}/planing/sprint?sprintId=${sprintId}`;
    updateLinkHref(GO_TO_SPRINT_LINK, newLinkOpenSprint);

    // validate data
    if (!_.isString(projectId)){
        $.notify("Invalid data is selected.", 'error');
        return;
    }

    // validate team
    if (!_.isString(teamId) || teamId == "0"){
        $.notify("Invalid team is selected.", 'error');
        return;
    }

    // validate sprint
    if (!_.isString(sprintId) || sprintId == "0"){
        $.notify("Invalid sprint is selected.", 'error');
        return;
    }

    const API_LINK_GET_SPRINT_REVIEW = `/dashboard/api/${projectId}/getSprintReview/${teamId}/${sprintId}`;

    let response_error = null;
    let response = await make_get_request(API_LINK_GET_SPRINT_REVIEW).catch(err=> {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * Return true if date is between two days including start and end day
 * @param {String} startDate 
 * @param {String} endDate 
 * @param {Date} date 
 * @param {String} formatDateBetween 
 * @returns {Boolean}
 */
function isDateBetween(startDate, endDate, date = new Date(), formatDateBetween=SPRINT_FORMAT_DATE){
    
    let startDateMoment = moment(startDate, formatDateBetween);
    let endDateMoment = moment(endDate, formatDateBetween);

    date = moment(date).format(formatDateBetween);

    return (moment(date, formatDateBetween).isBetween( startDateMoment, endDateMoment, undefined, '[]')  );
}

/**
 * Show a message to the user is the active sprint is a future sprint
 */
function checkIsFutureSprint(){

    // check is future sprint
    let isFutureSprint = ($(IS_FUTURE_SPRINT).val() == "true");

    if (isFutureSprint){
        let msg = "This is a future sprint.";
        showPopupMessage(FILTE_BY_SPRINT_REVIEW, msg, style="error", position="top", 4);
    }
}

/**
 * Show the button into the UI if the sprint is the current active sprint at the moment
 * @param {Boolean} isActiveSprint 
 */
function showCloseSprintButton(isActiveSprint){

    // check if this sprint is the current active sprint
    if (isActiveSprint){
        $(CLOSE_SPRINT_CONTAINER_BTN).removeClass("d-none");
    }else{
        $(CLOSE_SPRINT_CONTAINER_BTN).addClass("d-none");
    }   
}

/**
 * Show the button to start the new sprint into the UI
 * @param {Boolean} isFutureSprint 
 * @param {Boolean} isActiveSprint 
 */
function showStartSprintButton(isFutureSprint, isActiveSprint){

    // check if this is a future sprint and not the current active sprint
    if (isFutureSprint && !isActiveSprint){
        $(START_SPRINT_BTN_CONTAINER).removeClass("d-none");
    }else{
        $(START_SPRINT_BTN_CONTAINER).addClass("d-none");
    }
}