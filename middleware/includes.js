/**
 * The main pourpose of this file is to dynamically store all the styles imports in all views
 * as well as the imports of all scripts. 
 */

module.exports = {

    // Includes for dashboard
    dashboardPath: {
        styles: ["/stylesheets/statistics.css", "/stylesheets/scrum-main.css", "/stylesheets/backlog.css", "/stylesheets/work-item.css", "/stylesheets/dashboard.css"], 

        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/quotes.js", 
            "/javascripts/modals/projects.js", 
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/dashboard.js",
            "/javascripts/api-calls/api-project.js",
            "/javascripts/api-calls/api-users.js",
        ]
    },
    // includes for statistics
    statisticsPath: {
        styles: ["/stylesheets/statistics.css", "/stylesheets/scrum-main.css", "/stylesheets/backlog.css", "/stylesheets/work-item.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/statistics-member.js", 
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/api-calls/api-project.js",
            "/javascripts/dependecies/chart.min.js",
            "/javascripts/dependecies/chartjs-plugin-labels.min.js",
            "/javascripts/services/modal-confirmation.js",
        ]
    },
    planigWorkItemPath: {
        styles: ["/stylesheets/scrum-main.css","/stylesheets/backlog.css", "/stylesheets/work-item.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/work-items.js", 
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/update-work-item.js",
            "/javascripts/modals/edit-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/dependecies/col-resizable-min.js",
            "/javascripts/work-item-sub-menu.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/right-sidebar.js",
        ]
    },
    backlogPath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/work-items.js",
            "/javascripts/backlog.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/update-work-item.js",
            "/javascripts/modals/edit-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/dependecies/col-resizable-min.js",
            "/javascripts/work-item-sub-menu.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/right-sidebar.js",
        ]
    },
    sprintPath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/work-items.js",
            "/javascripts/backlog.js",
            "/javascripts/sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/update-work-item.js",
            "/javascripts/modals/edit-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/modals/sprint-points-graph.js",
            "/javascripts/dependecies/col-resizable-min.js",
            "/javascripts/work-item-sub-menu.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/right-sidebar.js",
            "/javascripts/dependecies/chart.min.js",
            "/javascripts/dependecies/chartjs-plugin-labels.min.js",
        ]
    },

    sprintReview: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css", "/stylesheets/sprint-review.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/work-items.js",
            "/javascripts/backlog.js",
            "/javascripts/sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/dependecies/chart.min.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/sprint-review.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/right-sidebar.js",
        ]
    },

    sprintBoard: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css",  "/stylesheets/sprint-board.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/work-items.js",
            "/javascripts/backlog.js",
            "/javascripts/sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/update-work-item.js",
            "/javascripts/modals/edit-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/sprint-board.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/right-sidebar.js",
        ]
    },

    managePath: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css", "/stylesheets/manage-routes.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/work-items.js",
            "/javascripts/backlog.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/update-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
        ]
    },
    queryPath: {

        styles: ["/stylesheets/scrum-main.css", "/stylesheets/backlog.css", "/stylesheets/work-item.css",  "/stylesheets/query.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
            "/javascripts/dependecies/jquery-ui.min.js",
            "/javascripts/work-items.js",
            "/javascripts/backlog.js",
            "/javascripts/sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/update-work-item.js",
            "/javascripts/queries.js",
            "/javascripts/modals/create-work-item.js",
            "/javascripts/modals/edit-work-item.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/dependecies/col-resizable-min.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/api-calls/api-queries.js",
            "/javascripts/right-sidebar.js",
        ]
    },
}