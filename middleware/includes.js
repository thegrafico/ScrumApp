/**
 * The main pourpose of this file is to dynamically store all the styles imports in all views
 * as well as the imports of all scripts. 
 */

module.exports = {

    // Includes for dashboard
    dashboardPath: {
        styles: ["/stylesheets/dashboard.css"], 
        scripts: ["/javascripts/quotes.js", "/javascripts/modals/projects.js"]
    },
    // includes for statistics
    statisticsPath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/statistics.css"], 
        scripts: ["/javascripts/statistics-member.js", "/javascripts/dependecies/bootstrap.bundle.min.js"]
    },
    planigWorkItemPath: {
        styles: ["/stylesheets/scrum-main.css","/stylesheets/backlog.css"], 
        scripts: [
            // "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js",
            // "/javascripts/planning-work-item.js", "/javascripts/dependecies/jquery-ui.min.js", 
            // "/javascripts/filter-and-search.js"
        ]
    }
}