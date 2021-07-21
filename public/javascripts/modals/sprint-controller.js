/**
 * Control the logic for the date-picker
*/

const DATE_RANGE_INPUT_ID = "#sprint-start-date-input";
const SPRINT_DURATION_SELECT_INPUT_ID = "#sprint-duration-input";
const CREATE_SPRINT_SUBMIT_BTN = "#create-sprint-btn-submit";
const SPRINT_NAME_INPUT = "#sprint-name-input";
const SPRINT_TEAM_INPUT = "#sprint-team-input";

const SPRINT_NAME_SPAN_ERROR = "#sprint-name-span-error";
const SPRINT_DATE_SPAN_ERROR = "#sprint-date-span-error";

const CLOSE_MODAL_SPRINT_BTN = "#close-sprint-modal";

$(function () {

    // getting the amount of days of the sprint - default
    const SPRINT_TIME_PERIOD_DAYS = parseInt( $(SPRINT_TIME_PERIDO_INPUT_ID).val());

    $(SPRINT_TEAM_INPUT).select2();
    
    // Config picker
    $(DATE_RANGE_INPUT_ID).daterangepicker({
        "opens": "center",
        "startDate": moment(), // today
        "endDate": moment().add(SPRINT_TIME_PERIOD_DAYS, 'days'),
        "minDate": moment().subtract(ONE_WEEK, 'days'), // One week later
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

    // SUBMIT SPRINT
    $(CREATE_SPRINT_SUBMIT_BTN).on("click", async function(){
        
        // ========= NAME ==============
        let sprintName = $(SPRINT_NAME_INPUT).val(); 

        if (!_.isString(sprintName) || _.isEmpty(sprintName) || sprintName.length < 3){
            showErrSpanMessage(SPRINT_NAME_SPAN_ERROR, "Invalid name. Length name must be > 3");
            return;
        }

        hideErrSpanMessage(SPRINT_NAME_SPAN_ERROR);

        // ============ DATE ==============
        console.log($(DATE_RANGE_INPUT_ID).val() );
        let {startDate, endDate} = formatDates( $(DATE_RANGE_INPUT_ID).val() )
        
        if (_.isNull(startDate) || _.isNull(endDate)){
            showErrSpanMessage(SPRINT_DATE_SPAN_ERROR, "Invalid dates.");
        }

        hideErrSpanMessage(SPRINT_DATE_SPAN_ERROR);

        // ============ TEAM ================
        let teamId = $(SPRINT_TEAM_INPUT).val();
        
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
            // update_html( 
            //     $(CURRENT_PAGE_ID).val(), 
            //     UPDATE_TYPE.ADD, 
            //     {"value": response.team.id, "text": response.team.name},
            //     UPDATE_INPUTS.TEAM
            // );
        }else{ // error messages
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
