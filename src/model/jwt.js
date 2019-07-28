"use strict";

const jwt = require('jsonwebtoken');
const crytoService = require('../service/crypto');

/**
 * Creates a new jwt signed with a sync hashing algorithm
 *
 * @function
 * @name signNewSyncToken
 * @param {string} secret The secret used to sign the token
 * @param {object} [payload] Data to be carried over by the jwt defaults to {}
 * @param {int} [expirationTimeInSeconds] Defines who long the token will be valid for
 * if set to 0 the token won't expire defaults to 0
 * @returns {Promise<string>} A new jwt
 */
async function signNewSyncToken(secret, payload = {}, expirationTimeInSeconds = 0) {
    let options = {
        'expiresIn': expirationTimeInSeconds,
        'algorithm': process.env.JWT_SYNC_ALGORITH,
        'jti': await crytoService.secureRandomString(16)
    };

    // TODO wrap in a try catch block
    return await jwt.sign(payload, secret, options);
}

/**
 * Uses the given secret to verify that the jwt is valid
 *
 * @function
 * @name verifySyncToken
 * @param {string} token A jwt to be verified
 * @param {string} secret The secret used to sign the token
 * @returns {Promise<boolean>} Will determine if the token is valid or not
 */
async function verifySyncToken(token, secret) {
    try {
        return await jwt.verify(token, secret);
    } catch(err) {
        // TODO log the error with more details
        throw Error("The token is invalid, please login again.");
    }
}

/**
 * Creates a new jwt signed with an async hashing algorithm
 *
 * @function
 * @name signNewAsyncToken
 * @param {string|Buffer} cert A RSA to be used to sign the key
 * @param {object} [payload] Data to be carried over by the jwt defaults to {}
 * @param {int} [expirationTimeInSeconds] Defines who long the token will be valid for
 * if set to 0 the token won't expire defaults to 0
 * @returns {Promise<string>} A new jwt
 */
async function signNewAsyncToken(cert, payload = {}, expirationTimeInSeconds = 0){
    let options = {
        'expiresIn': expirationTimeInSeconds,
        'algorithm': process.env.JWT_ASYNC_ALGORITH,
        'jti': await crytoService.secureRandomString(16)
    };

    // TODO wrap in a try catch block
    return await jwt.sign(payload, cert, options);
}

/**
 * Uses the given cert to verify that the jwt is valid
 *
 * @function
 * @name verifyAsyncToken
 * @param {string} token A jwt to be verified
 * @param {string|Buffer} cert A RSA to be used to sign the key
 * @returns {Promise<boolean>} Will determine if the token is valid or not
 */
async function verifyAsyncToken(token, cert) {
    try {
        return await jwt.verify(token, cert);
    } catch(err) {
        // TODO log the error with more details
        throw Error("The token is invalid, please login again.");
    }
}

module.exports.signNewSyncToken = signNewSyncToken;
module.exports.verifySyncToken = verifySyncToken;
module.exports.signNewAsyncToken = signNewAsyncToken;
module.exports.verifyAsyncToken = verifyAsyncToken;
