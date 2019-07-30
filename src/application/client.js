"use strict";

const jwt = require('../model/jwt');
const fs = require('fs');

/**
 * New sync token signing to be used by client applications
 *
 * @function
 * @name signSyncToken
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 * @returns {Promise<{token: string, status: string, message, string}|{status: string, message, string}>}
 */
async function signSyncToken(payload = {}, expirationTime = 0) {
    try {
        return {
            "token": await jwt.signNewSyncToken(process.env.JWT_SECONDARY_SECRET, payload, expirationTime),
            "status": "success",
            "message": "Token created successfully."
        }
    } catch (err) {
        console.log(`error at clientApplication.signSyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "There was an error creating the token, if the problem persist contact the system administrator."
        }
    }
}

/**
 * Decodes a sync token used by a client application
 *
 * @function
 * @name decodeSyncToken
 * @param {string} token The jwt to be validated
 * @returns {Promise<{payload: string, status: string, message: string}|{status: string, message: string}>}
 */
async function decodeSyncToken(token) {
    try {
        return {
            "payload": await jwt.verifySyncToken(token, process.env.JWT_SECONDARY_SECRET),
            "status": "success",
            "message": "The token is valid."
        }
    } catch (err) {
        console.log(`error at clientApplication.decodeSyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "The token is invalid."
        }
    }
}

module.exports.signSyncToken = signSyncToken;
module.exports.decodeSyncToken = decodeSyncToken;
