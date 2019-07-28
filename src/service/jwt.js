"use strict";

const jwt = require('jsonwebtoken');

/**
 * 
 * @param payload
 * @param expirationTimeInSeconds
 * @param secret
 * @returns {Promise<void>}
 */
async function signNewSyncToken(secret, payload = {}, expirationTimeInSeconds = null) {
    let options = {
        'expiresIn': expirationTimeInSeconds,
        'algorithm': 'HS512'
    };

    return await jwt.sign(payload, secret, options);
}

/**
 *
 * @param token
 * @param secret
 * @returns {Promise<void>}
 */
async function verifySyncToken(token, secret) {
    try {
        return await jwt.verify(token, secret);
    } catch(err) {
        throw Error("The token is invalid, please login again.");
    }
}

module.exports.signNewSyncToken = signNewSyncToken;
module.exports.verifySyncToken = verifySyncToken;
