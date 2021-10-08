/**
 * Here will be all api calls for the sprint API
*/


/**
 * Get all sprint for a team
 * @param {String} teamId 
 * @returns {Object} response and error_response 
 * 
*/
async function getSprintsForTeam(teamId){
    
    const projectId = getProjectId();
    
    const API_LINK_GET_SPRINTS_FOR_TEAM = `/dashboard/api/${projectId}/getTeamSprints/${teamId}`;

    let response_error = null;
    const response = await make_get_request(API_LINK_GET_SPRINTS_FOR_TEAM).catch(err => {
        response_error = err;
    });

   return {"response": response, "response_error": response_error};
}


/**
 * Remove the sprint from a team
 * @param {String} teamId 
 * @param {Object} data - Expecting: {sprintId}
 */
async function removeSprintFromTeam(teamId, data){
    const projectId = getProjectId();
    const API_LINK_REMOVE_SPRINT_FROM_TEAM = `/dashboard/api/${projectId}/removeSprintForTeam/${teamId}`;

    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_SPRINT_FROM_TEAM, data).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}