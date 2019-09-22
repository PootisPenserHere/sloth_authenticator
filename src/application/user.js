"use strict";

/**
 * Contains the actions to perform over the users of this api including login and transformations
 * to their database estate
 *
 * @module userApplication
 */

const userModel = require('../model/user');
const jwtModel = require('../model/jwt');

async function login(username, plainTextPassword) {
    let credentialsValidity = await userModel.verifyCredentials(username, plainTextPassword);

    let response = {};

    // TODO evaluate using a try catch here
    if(credentialsValidity) {
        // TODO add payload
        let payload = {
            "one": 1
        };

        response.token = await jwtModel.signNewToken(
            payload,
            process.env.JWT_LOGIN_TOKEN_ALGORITHM,
            parseInt(process.env.JWT_DEFAULT_SESSION_TIME)
        );

        response.status = "success";
        response.message = "Login successful.";
    } else {
        response.status = "error";
        response.message = "Invalid credentials.";
    }

    return response;
}

module.exports.login = login;
