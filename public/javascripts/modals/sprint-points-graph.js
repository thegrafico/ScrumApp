const BNT_SHOW_CHART = "#showPointsBtn";
const TABLE_ROW_POINTS = "td.storyPointsRow";

$(function () {

    let chartJs = undefined;

    // default color of the text
    Chart.defaults.color = "white";
    Chart.defaults.font.size = 12;
    Chart.register(ChartDataLabels);


    $(BNT_SHOW_CHART).on("click", function(){

        // getting the points for the work item
        let getWorkItemPoints = getPointsAndUpdate(TABLE_ROW_POINTS, false);

        console.log(getWorkItemPoints);
        if (!chartJs){

            let config = getConfigChart(getWorkItemPoints);

            chartJs = loadChart(config);
        }else{
            // update
            updateChart(chartJs, getWorkItemPoints);
        }

    });
});

/**
 * Update data from the chart
 * @param {Chart} chart 
 * @param {Object} workItemPoints 
 */
function updateChart(chart, workItemPoints){
    chart.data.datasets[0].data = [workItemPoints["total"]];
    chart.data.datasets[1].data = [workItemPoints["new"]];
    chart.data.datasets[2].data = [workItemPoints["active"]];
    chart.data.datasets[3].data = [workItemPoints["review"]];
    chart.data.datasets[4].data = [workItemPoints["completed"]];

    chart.update();
}


/**
 * get 
 * @param {Object} workItems
 * @returns 
 */
function getConfigChart(workItems){

    const data = {
        labels: ["Work Items"],
        datasets: [
            {
                label: 'Total Points',
                data: [workItems["total"]],
                backgroundColor: '#d06800',
                stack: 'Stack 0',
            },
            {
                label: 'New',
                data: [workItems["new"]],
                backgroundColor: '#939aa175',
                stack: 'Stack 1',
            },
            {
                label: 'Active',
                data: [workItems["active"]],
                backgroundColor:'#2c81baa8',
                stack: 'Stack 1',
            },
            {
                label: 'Review',
                data: [workItems["review"]],
                backgroundColor: '#f39c12',
                stack: 'Stack 1',
            },
            {
                label: 'Completed',
                data: [workItems["completed"]],
                backgroundColor: '#00a078b7',
                stack: 'Stack 1',
            },
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
          scales: {
            y: {
                beginAtZero: true,
                display:true,
                title: {
                    display:true,
                    text: "Points"
                }
            }
          },
          plugins: {
            datalabels: {
                display: function(context) {
                   return context.dataset.data[context.dataIndex] >= 1; // or >= 1 or ...
                }
            },
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sprint Story Points'
            }
        }
        },
    };

    return config;
}

/**
 * 
 * @param {Object} config 
 * @returns {VoidFunction}
 */
function loadChart(config){

    let ctx = document.getElementById('pointsOverview').getContext('2d');
    
    return new Chart(ctx, config);
}