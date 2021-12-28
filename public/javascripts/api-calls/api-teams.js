/**
 * Here will be all api calls for the teams API
*/


/**
 * Delete team from project
 * @param {String} teamId - id of the team
 * @returns {Object} - response, response_error
 */
async function deleteTeamFromProject(teamId){

    const projectId = getProjectId();

    const API_LINK_DELETE_TEAM = `/dashboard/api/${projectId}/deleteTeam`;

    let response_error = null;
    const response = await make_post_request( API_LINK_DELETE_TEAM, {"teamId": teamId} ).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}

/**
 * Delete teams from project
 * @param {Array} teamsId - id of the teams
 * @returns {Object} - response, response_error
 */
async function deleteTeamsFromProject(teamsId){

    const projectId = getProjectId();

    const API_LINK_DELETE_TEAM = `/dashboard/api/${projectId}/deleteTeams`;

    let response_error = null;
    const response = await make_post_request( API_LINK_DELETE_TEAM, {"teamsId": teamsId} ).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}



/**
 * Create new team
 * @param {String} name - name of the team
 * @param {String} initials - Team initials
 * @returns {Object} - response, response_error
 */
async function createTeam(name, initials){
    
    // Request var
    const projectId = getProjectId();
    const API_LINK_CREATE_TEAM = `/dashboard/api/${projectId}/newTeam`;
    const data = {"teamName": name, "teamInitials": initials};

    let response_error = null;
    const response = await make_post_request(API_LINK_CREATE_TEAM, data).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}


/**
 * Edit team - for now is just the team name
 * @param {String} teamId - id of the team
 * @param {Object} update - Update for the team
 * @returns {Object} - response, response_error
 */
async function editTeam(teamId, update){
    
    // getting project id and team id in order to make the request
    const projectId = getProjectId();

    const API_LINK_EDIT_TEAM = `/dashboard/api/${projectId}/editTeam/${teamId}`;

    let response_error = undefined;
    const response = await make_post_request(API_LINK_EDIT_TEAM, {name: update["name"], initials: update["initials"]}).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}



/**
 * Get users for team
 * @param {String} teamId - id of the team
 * @param {Boolean} getUsersNotInThisTeam - if true, get users NOT in this team. 
 * @returns {Object} - response, response_error
 */
async function getTeamUsers(teamId, getUsersNotInThisTeam = false){

    const projectId = getProjectId();

    let API_LINK_GET_TEAM_USERS = '';
    if (getUsersNotInThisTeam){
        API_LINK_GET_TEAM_USERS = `/dashboard/api/${projectId}/getTeamUsers/${teamId}?notInTeam=true`;
    }else{
        API_LINK_GET_TEAM_USERS = `/dashboard/api/${projectId}/getTeamUsers/${teamId}`;
    }

    let response_error = undefined;
    const response = await make_get_request(API_LINK_GET_TEAM_USERS,).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}


/**
 * add user to team
 * @param {String} teamId - id of team 
 * @param {String} userId - id of the user
 * @returns {Object} - response, response_error
 */
async function addUserToTeam(teamId, userId){

    const projectId = getProjectId();
    const API_LINK_ADD_USER_TO_TEAM = `/dashboard/api/${projectId}/addUserToTeam/`

    const data = {"userId": userId, "teamId": teamId};

    let response_error = null;
    const response = await make_post_request(API_LINK_ADD_USER_TO_TEAM, data).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}
