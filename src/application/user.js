"use strict";

/**
 * Contains the actions to perform over the users of this api including login and transformations
 * to their database estate
 *
 * @module userApplication
 */

const userModel = require('../model/user');
const jwtModel = require('../model/jwt');
const blacklistModel = require('../model/blacklist');
const loggerService = require('../service/logger');

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

async function logout(token) {
    try {
        await blacklistModel.revokeToken(token);

        return {
            "status": "success",
            "message": "Successfully logged out."
        }
    } catch (err) {
        loggerService.logger.error(`error at userApplication.logout caused by ${err}`);
        return {
            "status": "error",
            "message": "There was an error while attempting to log out, the session token might be corrupted."
        }
    }
}

module.exports.login = login;
module.exports.logout  = logout;
