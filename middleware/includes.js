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
            "/javascripts/create-work-item-modal.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
        ]
    },
    planigWorkItemPath: {
        styles: ["/stylesheets/scrum-main.css","/stylesheets/backlog.css", "/stylesheets/work-item.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
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
            "/javascripts/work-item-sub-menu.js",
            "/javascripts/api-calls/api-sprints.js",
            "/javascripts/api-calls/api-work-items.js",
            "/javascripts/api-calls/api-teams.js",
            "/javascripts/api-calls/api-users.js",
            "/javascripts/right-sidebar.js",
        ]
    },

    sprintReview: {
        styles: ["/stylesheets/scrum-main.css", "/stylesheets/work-item.css", "/stylesheets/backlog.css", "/stylesheets/sprint-review.css"], 
        scripts: [
            "/javascripts/feedback-message.js", 
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
            "/javascripts/planning-work-item.js",
            "/javascripts/planning-backlog.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/create-work-item-modal.js",
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
            "/javascripts/planning-work-item.js",
            "/javascripts/planning-backlog.js",
            "/javascripts/planning-sprint.js",
            "/javascripts/dependecies/bootstrap.bundle.min.js",
            "/javascripts/filter-and-search.js",
            "/javascripts/create-work-item-modal.js",
            "/javascripts/update-work-item.js",
            "/javascripts/queries.js",
            "/javascripts/show-work-item-modal.js",
            "/javascripts/modals/user-controller.js",
            "/javascripts/modals/team-controller.js",
            "/javascripts/modals/sprint-controller.js",
            "/javascripts/modals/sprint-points-graph.js",
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