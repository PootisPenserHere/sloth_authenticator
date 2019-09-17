"use strict";

/**
 * Contains the actions to perform over the users of this api including login and transformations
 * to their database estate
 *
 * @module userApplication
 */

const userModel = require('../model/user');

async function login(username, plainTextPassword) {
    return await userModel.verifyCredentials(username, plainTextPassword)
}

module.exports.login = login;
