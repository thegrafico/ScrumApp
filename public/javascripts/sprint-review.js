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

$(function () {

    // ======= DEFAULTS =======
    $(FILTE_BY_TEAM_SPRINT_REVIEW).select2();
    $(FILTE_BY_SPRINT_REVIEW).select2();

    // default color of the text
    Chart.defaults.color = "white";
    Chart.defaults.font.size = 16;
    // =========================

    // Work Items - This variable is declare in the ejs view. 
    workItems = formatWorkItemDates(workItems, DATE_LABEL_FORMAT);

    // ====== PLOTS ======
    let burnChart = burndownChart(pointsHistory, DATE_LABEL_FORMAT);
    let barchart = breakDownChart(workItems);
    // console.log(getBreakdownTypeData(workItems));


    // ============= FILTERS ============================

    // FILTER BY TEAM
    $(FILTE_BY_TEAM_SPRINT_REVIEW).on("change", async function(){
        const projectId = $(PROJECT_ID).val();

        const teamId = $(this).val();

        const API_LINK_GET_SPRINT_REVIEW_BY_TEAM = `/dashboard/api/${projectId}/getSprintReview/${teamId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_SPRINT_REVIEW_BY_TEAM).catch(err=> {
            response_error = err;
        });
        
        // Success message
        removeAllOptionsFromSelect(FILTE_BY_SPRINT_REVIEW, null);
        cleanTable(WORK_ITEM_TABLE);

        // change the select on the work item
        updateSelectOption(WORK_ITEM["team"], UPDATE_TYPE.CHANGE,teamId);
        removeAllOptionsFromSelect(WORK_ITEM["sprint"], {"text": "Not sprint found", "value": "0"},true);

        if (response){
            
            // Check work items
            if (_.isArray(response.workItems) && response.workItems.length > 0){
                updateReviewPage(response.workItems, response["statusReport"], burnChart, barchart);
            }else{
                // hiding elements
                $(GO_TO_SPRINT_LINK).addClass("d-none");
                $(REVIEW_CONTAINER).addClass("d-none");
                $.notify("This team does not have any work item yet.", "error");
            }

            // Check sprint
            if (response.sprints.length > 0){
                
                // update the select option
                for (const sprint of response.sprints) {    
                    let isSelected = sprint["_id"].toString() == response["activeSprint"].toString();
                    
                    let optionText = formatSprintText(sprint, isSelected);

                    // add the options to the sprint
                    updateSelectOption(
                        FILTE_BY_SPRINT_REVIEW, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
                    );

                    // updating create work item
                    updateSelectOption(
                        WORK_ITEM["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
                    );

                    // feedback message in case the active sprint is a past sprint
                    if (isSelected && sprint["status"] != SPRINT_STATUS["Active"]){
                        let message = `This is a ${sprint["status"]} sprint.`;
                        showPopupMessage(FILTE_BY_SPRINT_REVIEW, message);
                    }
                }
            }else{ 
                showPopupMessage(FILTE_BY_SPRINT_REVIEW, "Not Sprint found");
            }

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        } 
    });

    // FILTER BY SPRINT
    $(document).on("change", FILTE_BY_SPRINT_REVIEW, async function(){

        $(STATUS_REPORT_DATA_CONTAINER).remove();

        const sprintId = $(this).val();

        const {response, response_error} = await getSprintReview(sprintId, FILTE_BY_TEAM_SPRINT_REVIEW);

        if (response){
            
            // Check work items
            if (_.isArray(response.workItems) && response.workItems.length > 0){
                updateReviewPage(response.workItems, response["statusReport"], burnChart, barchart);
            }else{

                $(GO_TO_SPRINT_LINK).addClass("d-none");

                // hiding elements
                $(REVIEW_CONTAINER).addClass("d-none");

                $.notify("This sprint does not have any work item yet.", "error");
            }

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

    // ==============================================

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
        // Exit the loop if we already have all the data for the work items
        // if (currentPoints == 0){
            
        //     if (isTodayBetween){
                
        //         for (let j = i; j < labelDates.length; j++) {
        //             date = labelDates[j];

        //             burndownData.push(currentPoints);

        //             if (date === today){
        //                 break;
        //             }                    
        //         }
        //     }
        //     break;
        // };

        // console.log(`At ${date} they were ${completePointsAtDatePoints} Story Points completed`);
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
    
    const projectId = $(PROJECT_ID).val();
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

