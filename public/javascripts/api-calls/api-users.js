/**
 * Here will be all api calls for the users API
*/



/**
 * Remove user from team
 * @param {String} teamId 
 * @param {Array} users 
 * @returns {Object} response, response_error
 */
async function removeUserFromTeam(teamId, users){

    const projectId = getProjectId();

    const API_LINK_REMOVE_USERS_FROM_TEAM = `/dashboard/api/${projectId}/removeUsersFromTeam/`;

    const data = {"teamId": teamId, "userIds": users};

    let response_error = undefined;
    const response = await make_post_request(API_LINK_REMOVE_USERS_FROM_TEAM, data).catch(err => {
        response_error = err;
    });
    return {"response": response, "response_error": response_error};
}

/**
 * Update user
 * @param {String} userId 
 * @param {Object} update 
 * @returns {Object} response, response_error
 */
async function updateUser(userId, update){

    const projectId = getProjectId();

    // API link
    const API_LINK_UPDATE_USER = `/dashboard/api/${projectId}/updateUser`;

    let response_error = null;
    const response = await make_post_request(API_LINK_UPDATE_USER, {userId: userId, privilege: update["privilege"]}).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}


/**
 * send invitation to user to join the project
 * @param {String} userEmail - user email
 * @returns {Object} response, response_error
 */
async function inviteUserToProject(userEmail){

    const projectId = getProjectId();

    const API_LINK_ADD_USER_TO_PROJECT = `/dashboard/api/${projectId}/addUserToProject`;
    let data = {"userEmail": userEmail};

    let response_error = null;
    let response = await make_post_request(API_LINK_ADD_USER_TO_PROJECT, data).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}

/**
 * Remove user from current project
 * @param {String} userId - id of the user
 * @returns {Object} response, response_error
 */
async function removeUserFromProject(userId){

    const projectId = getProjectId();

    const API_LINK_REMOVE_USER_FROM_PROJECT = `/dashboard/api/${projectId}/deleteUserFromProject`;
    const data = {"userId": userId};

    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_USER_FROM_PROJECT, data).catch(err => {
        response_error = err;
    });
    
    return {"response": response, "response_error": response_error};
}

/**
 * Remove users from current project
 * @param {Array} usersId - id of the users
 * @returns {Object} response, response_error
 */
async function removeUsersFromProject(usersId){

    const projectId = getProjectId();

    const API_LINK_REMOVE_USERS_FROM_PROJECT = `/dashboard/api/${projectId}/deleteUsersFromProject`;
    const data = {"userIds": usersId};

    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_USERS_FROM_PROJECT, data).catch(err => {
        response_error = err;
    });
    
    return {"response": response, "response_error": response_error};
}
