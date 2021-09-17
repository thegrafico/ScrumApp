
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const projectCollection         = require("../../dbSchema/projects");
const SprintCollection          = require("../../dbSchema/sprint");
const UserQueriesCollection     = require("../../dbSchema/userQueries");
const moment                    = require("moment");
const _                         = require("lodash");
let router                      = express.Router();

const {
    UNASSIGNED_SPRINT,
    UNASSIGNED,
    QUERY_FIELD,
    joinData,
    cleanQuery,
    arrayToObject,
    doesQueryValueMatch,
} = require('../../dbSchema/Constanst');


/**
 * METHOD: GET - get a query by id
 */
router.get("/api/:id/getQuery", middleware.isUserInProject, async function (req, res) {
    console.log("Getting request to get the query...");

    const projectId = req.params.id;
    const userId = req.user["_id"];

    // in case the user wants just one query
    let { queryId } = req.query;

    let response = {};

    let userQueries = await UserQueriesCollection.findOne({user: userId}).catch(err => {
        console.log("Error getting user queries: ", err);
    });

    // check user queries
    if (_.isUndefined(userQueries) || _.isNull(userQueries)){
        response["msg"] = "Sorry, Cannot find any user queries. Try later.";
        res.status(400).send(response);
        return;
    }

    let requestedQuery = null;
    for (let query of userQueries["queries"]){
        
        // check if query match
        if  (query["_id"] == queryId){
            requestedQuery = query;
            break;
        }
    }

    // check if the query was NOT found
    if (_.isNull(requestedQuery)){
        response["msg"] = "Sorry, Cannot find the information for this query.";
        res.status(400).send(response);
        return;
    }

    response["msg"] = "Query found.";
    response["query"] = requestedQuery["query"];
    res.status(200).send(response);
});


/**
 * METHOD: POST - fetch all sprints for a team
 */
router.post("/api/:id/getWorkItemsByQuery", middleware.isUserInProject, async function (req, res) {
    console.log("request to get work item by query...");

    const projectId = req.params.id;

    // getting query request
    let { query } = req.body;

    let response = {};

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });
    
    // verify project
    if (!projectInfo){
        response["msg"] = "Sorry, Cannot get the information of the project.";
        res.status(400).send(response);
        return;
    }

    // check if we received data
    if (!_.isArray(query) || _.isEmpty(query)){
        response["msg"] = "Oops, it seems the data received is empty";
        res.status(200).send(response);
        return;
    }

    // clean the query object and divide it by condition
    query = cleanQuery(query);

    if (_.isEmpty(query)){
        response["msg"] = "Oops, it seems there was an error processing the query. Please try later.";
        res.status(200).send(response);
        return;
    }

    // getting all work items from project
    let workItems = await projectInfo.getWorkItems(true).catch(err => {
        console.error("Error getting work items: ", err);
    });

    // check if we have work items
    if (!_.isArray(workItems) || _.isEmpty(workItems) ){
        response["msg"] = "Sorry, it seems there is not work items for this project.";
        res.status(200).send(response);
        return;
    }

    // getting the users from the project
    let users = await projectInfo.getUsers().catch(err => console.log(err)) || [];

    // getting work item teams 
    let teams = [...projectInfo.teams];

    // get all sprints for project
    let sprints = await SprintCollection.find({projectId}).catch(err => console.error(err)) || [];
    joinData(workItems, teams, "teamId", "equal", "_id", "team", UNASSIGNED);
    joinData(workItems, sprints, "_id", "is in", "tasks", "sprint", UNASSIGNED_SPRINT, true);

    const FIELDS = arrayToObject(Object.keys(QUERY_FIELD));

    // init filtered work items to be all work items at the beginning. 
    let filteredWorkItems = workItems;
    let currentWorkItems = filteredWorkItems;

    // since the query is divided by logical condition
    // here we get the bunch of queries for each condition
    for (let rowsQuery of query){

        // if at this point, there is not work items, just break the program. 
        if (_.isEmpty(filteredWorkItems)){ break;}

        // reset the value in order to keep just the filtered elements
        filteredWorkItems = [];

        // check all work items available 
        for(let workItem of currentWorkItems){
    
            for (eachRowQuery of rowsQuery){

                let logicalOr = false;

                // user query request.
                const field = eachRowQuery["field"];
                const dbField = QUERY_FIELD[field]["dbField"];
                const operator = eachRowQuery["operator"];
                let value = (eachRowQuery["value"] || "").trim();

                // there are two status field
                
                switch (field) {
                    case FIELDS["WORK_ITEM_TITLE"]:
                        logicalOr = doesQueryValueMatch(workItem[dbField], operator, value.trim());
                        break;
                    case FIELDS["ASSIGNED_USER"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField]["name"], operator, value) );
                        break;
                    case FIELDS["STORY_POINTS"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField], operator, value) );
                        break;
                    case FIELDS["PRIORITY_POINTS"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField], operator, value) );
                        break;
                    case FIELDS["WORK_ITEM_STATUS"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField], operator, value) );
                        break;
                    case FIELDS["TEAM"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField]["name"], operator, value) );
                        break;
                    case FIELDS["WORK_ITEM_TYPE"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField], operator, value));
                        break;
                    case FIELDS["WORK_ITEM_DESCRIPTION"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField], operator, value));
                        break;
                    case FIELDS["TAGS"]:
                        for (let tags of workItem[dbField]){
                            logicalOr = (doesQueryValueMatch(tags, operator, value) || logicalOr);
                        }
                        break;
                    case FIELDS["COMMENTS"]:
                        for (let comment of workItem[dbField]){
                            logicalOr = (doesQueryValueMatch(comment, operator, value) || logicalOr);
                        }
                        break;
                    case FIELDS["SPRINT_NAME"]:
                        logicalOr = (doesQueryValueMatch(workItem["sprint"][dbField], operator, value));
                        break;
                    // TODO: add this to the work item
                    case FIELDS["SPRINT_STATUS"]:
                        logicalOr = (doesQueryValueMatch(workItem[dbField], operator, value));
                        break;
                    case FIELDS["SPRINT_START_DATE"]:
                        logicalOr = (doesQueryValueMatch(workItem["sprint"][dbField], operator, value, true));
                        break;
                    case FIELDS["SPRINT_END_DATE"]:
                        console.log(`Evaluating: ${workItem["sprint"][dbField]} = ${value}`)
                        logicalOr = (doesQueryValueMatch(workItem["sprint"][dbField], operator, value, true));
                        break;
                    case FIELDS["SPRINT_POINTS"]:
                        logicalOr = (doesQueryValueMatch(workItem["sprint"][dbField], operator, value, true));
                        break;
                    default:
                        break;
                }
                if (logicalOr){
                    filteredWorkItems.push(workItem);
                }
            }

            // every time we run a query, we just use the current amound of work items already filtered. 
            currentWorkItems = filteredWorkItems;


        }
    }

    console.log("ELEMENTS FOUND: ", currentWorkItems.length);
    // send response to user
    response["msg"] = "Success";
    response["workItems"] = currentWorkItems;
    res.status(200).send(response);
    return;

});


/**
 * METHOD: POST - Add a comment to the work item
 */
router.post("/api/:id/saveQuery", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to save query for user...");

    const projectId = req.params.id;

    // getting query request
    let {
        query,
        name,
    } = req.body;

    let response = {};

    // check data received
    if (!_.isArray(query) || _.isEmpty(query) || !_.isString(name) || _.isEmpty(name)){
        response["msg"] = "Sorry, The Data received is invalid.";
        res.status(400).send(response);
        return;
    }

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // verify project
    if (!projectInfo) {
        response["msg"] = "Sorry, Cannot get the information of the project.";
        res.status(400).send(response);
        return;
    }
    const userId = req.user["_id"];

    // get the user queries
    let err_user_query = null;
    let userQueries = await UserQueriesCollection.findOne({user: userId}).catch(err => {
        console.error("Error finding the user queries: ", err);
        err_user_query = err;
    });


    // check if there was an error with the query
    if (err_user_query){
        response["msg"] = "Sorry, There was an problem getting yours queries. Please try to save it later.";
        res.status(400).send(response);
        return;
    }else if(_.isUndefined(userQueries) || _.isNull(userQueries)){
        // That means the user does not have any query yet.

        let newQueryData = {
            user: req.user["id"],
            queries: [{
                "name": name,
                "query": query,
            }],
        }

        // create the user query
        userQueries = await UserQueriesCollection.create(newQueryData).catch(err => {
            console.error("Error saving the query for the user: ", err);
        });

        // success. Send the new query back
        if (!_.isUndefined(userQueries) && !_.isNull(userQueries)){
            response["msg"] = "Query saved successfully!";
            response["query"] = userQueries;
            res.status(200).send(response);
            return;
        }

        response["msg"] = "Oops, There was a problem saving the query. Please try later.";
        res.status(400).send(response);
        return;
    }
    // at this point, we know the user have a query record available

    // check if the name for the query already is in the queries for the user
    if (userQueries.isNameInQueries(name)){
        response["msg"] = "Sorry, The name for the query already exist. Please select another name.";
        res.status(400).send(response);
        return;
    }

    // adding the new query to the user
    userQueries.queries.push({"name": name, "query": query});

    await userQueries.save().catch(err => {
        console.log("Error saving the query: ", err);
    });

    response["query"] = userQueries;
    response["msg"] = "Query Saved successfully!";
    res.status(200).send(response);
});


/**
 * METHOD: POST - remove query by id
 */
router.post("/api/:id/removeMyQuery", middleware.isUserInProject, async function (req, res) {
    
    const userId = req.user["_id"];

    // in case the user wants just one query
    let { queryId } = req.body;

    let response = {};

    let query_error = null;
    let queryWasRemoved = await UserQueriesCollection.findOneAndUpdate(
        {user: userId}, 
        {$pull: {queries: {_id: queryId}} }
    ).catch(err => {
        query_error = err;
        console.log("Error removing user queries: ", err);
    });

    // check object
    if (query_error){
        response["msg"] = "Sorry, there was a error removing the query";
        res.status(400).send(response);
    }

    response["msg"] = "Query Removed successfully.";
    res.status(200).send(response);
});


module.exports = router;
