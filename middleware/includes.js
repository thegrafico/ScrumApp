/**
 * The main pourpose of this file is to dynamically store all the styles imports in all views
 * as well as the imports of all scripts. 
 */

module.exports = {

    // Includes for dashboard
    dashboardPath: {
        styles: ["/stylesheets/dashboard.css"], 
        scripts: ["/javascripts/quotes.js", "/javascripts/modals/projects.js", "/javascripts/dependecies/bootstrap.bundle.min.js"]
    },
    // includes for statistics
    statisticsPath: {
        styles: ["/stylesheets/statistics.css", "/stylesheets/scrum-main.css", "/stylesheets/backlog.css", "/stylesheets/work-item.css"], 
        scripts: [
            "/javascripts/statistics-member.js", 
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/create-work-item-modal.js",

        ]
    },
    planigWorkItemPath: {
        styles: ["/stylesheets/scrum-main.css","/stylesheets/backlog.css", "/stylesheets/work-item.css"], 
        scripts: [
            "/javascripts/planning-work-item.js", 
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/create-work-item-modal.js",
            "/javascripts/update-work-item.js",
            "/javascripts/show-work-item-modal.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/dependecies/col-resizable-min.js",
        ]
    },
    backlogPath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css"], 
        scripts: [
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/planning-work-item.js",
            "/javascripts/planning-backlog.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/create-work-item-modal.js",
            "/javascripts/update-work-item.js",
            "/javascripts/show-work-item-modal.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/dependecies/col-resizable-min.js",

        ]
    },
    sprintPath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css"], 
        scripts: [
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/planning-work-item.js",
            "/javascripts/planning-backlog.js",
            "/javascripts/planning-sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/create-work-item-modal.js",
            "/javascripts/update-work-item.js",
            "/javascripts/show-work-item-modal.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/modals/sprint-points-graph.js",
            "/javascripts/dependecies/col-resizable-min.js",
        ]
    },

    sprintReview: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css", "/stylesheets/sprint-review.css"], 
        scripts: [
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/planning-work-item.js",
            "/javascripts/planning-backlog.js",
            "/javascripts/planning-sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/create-work-item-modal.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/sprint-review.js",

        ]
    },

    managePath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css", "/stylesheets/manage-routes.css"], 
        scripts: [
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/planning-work-item.js",
            "/javascripts/planning-backlog.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/create-work-item-modal.js",
            "/javascripts/update-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
        ]
    }
}