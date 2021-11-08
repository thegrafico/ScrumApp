const userEmailId = "#userEmail";
const btnAddUserSubmit = "#btnAddUser";
const addMemberModalId = "#create-user";
const spanErrorEmailId = "#createUserErrorMessage";
const addMemberFormId = "#inviteUserToProject";
const btnRemoveUserSubmit = "#btnRemoveUser";
const emailToRemove = "#removeUsersNameOrEmails";
const spanErrorRemoveEmailId = "#removeUserErrorMessage";
const removeMemberFormId = "#removeUserFromProject";
const removeMemberModalId = "#remove-user";

const BTN_SAVE = "#saveStatusBtn";

const NUMBERS_OF_MEMBERS_TEXT = "#number-of-members-text";
const NUMBER_OF_MEMBERS_VALUE = "#number-of-members-value";

const PROJECT_STATUS_SELECT = "#projectStatus";

const STATUS_BREAKDOWN_CONTAINER = "statusBreakdownChart";
CHANGES = {
    "status": null,
    "description": null
};

// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    showActiveTab();

    // default color of the text
    Chart.defaults.color = "white";
    Chart.defaults.font.size = 12;
    Chart.register(ChartDataLabels);

    breakDownChart();

    $(PROJECT_STATUS_SELECT).select2();
    $(REMOVE_USER_MODAL_INPUT).select2();

    const projectId = getProjectId();

    // save as soom as the user change the status
    $(PROJECT_STATUS_SELECT).on("change", async function(){
        let status = $(this).val();

        let {response, response_error} = await updateProjectStatus(projectId, status);

        if (response_error){
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });
});

function getBreakdownData(){
    
   let chartData = {};

    const CHART_DATA_CONTAINER = "#chart-data";
    
    $(`${CHART_DATA_CONTAINER} input`).each( function (){
        let status = $(this).attr("name");
        let value = $(this).val();
        chartData[status] = value;
    });

    return chartData;
}

/**
 * Create breakdownChart
 * @returns
 */
 function breakDownChart(){

    const labels = [
        WORK_ITEM_STATUS["New"], 
        WORK_ITEM_STATUS["Active"], 
        WORK_ITEM_STATUS["Review"], 
        WORK_ITEM_STATUS["Completed"],
        WORK_ITEM_STATUS["Block"]
    ];

    const breakdownData = getBreakdownData();

    const data = {
        labels: labels,
        datasets: [
            {
                data: [
                    breakdownData["New"], 
                    breakdownData["Active"], 
                    breakdownData["Review"],
                    breakdownData["Completed"],
                    breakdownData["Block"],
                ],
                backgroundColor: [
                    '#939aa1',
                    '#2c81ba',
                    '#cf850f',
                    '#00a077',
                    '#c44133',
                ],
            },    
        ]
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
                    text: "Number of work items",
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
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Work Item Status breakdown'
                }
            }
        },
    };

    return getChart(config, STATUS_BREAKDOWN_CONTAINER);
}

/**
 * 
 * @param updateType.ADD - action to add the members
 * @param updateType.DELETE - action to remove a member
 * @param {String} userId - if action delete, then userId should be populated 
 * @returns 
 */
function updateStatisticsHtml(updateType, valueToUpdate){
    let currentNumberOfMembers = $(NUMBER_OF_MEMBERS_VALUE).val();

    if (_.isEmpty(currentNumberOfMembers) || isNaN(currentNumberOfMembers)){
        return "Invalid number of users in project";
    }

    currentNumberOfMembers = parseInt(currentNumberOfMembers);

    if (updateType === UPDATE_TYPE.ADD){
        currentNumberOfMembers++;
        $(NUMBERS_OF_MEMBERS_TEXT).text(`${currentNumberOfMembers} members`);
        $(NUMBER_OF_MEMBERS_VALUE).val(currentNumberOfMembers);
    }else if(updateType === UPDATE_TYPE.DELETE){

        // updating text
        if (currentNumberOfMembers - 1 <= 1){
            $(NUMBERS_OF_MEMBERS_TEXT).text(`One man army`);
            $(NUMBER_OF_MEMBERS_VALUE).val(1);
        }else{
            $(NUMBERS_OF_MEMBERS_TEXT).text(`${--currentNumberOfMembers} members`);
            $(NUMBER_OF_MEMBERS_VALUE).val(currentNumberOfMembers);
        }
    }
}
