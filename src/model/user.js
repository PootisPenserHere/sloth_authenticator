"use strict";

/**
 * Contains the logic to handle the users of this api, with users being those who have
 * credentials to authenticated themselves and being distinguished as master or service
 * type of users
 *
 * @module userModel
 */

const usersRepository = require('../repository/users');
const userConstants = require('../domain/constant/user');
const cryptoService = require('../service/crypto');

/**
 * Counts the total number of master users existing in the users table
 *
 * Note: the status is ignored as the username key has an unique index that will
 * cause conflict if the same user is attempted to be created again
 *
 * @returns {Promise<number>} The number of master users registered
 */
async function numberOfExistingMasterUsers() {
    let response = await usersRepository.findAndCountAll({
        where: {
            accessType: userConstants.TYPE_MASTER
        }
    });

    return response.count;
}

/**
 * Create a new user
 *
 * @function
 * @name save
 * @param {string} name Name or description for the user
 * @param {string} username The public identifier with which the user will authenticate
 * @param {string} plaintextPassword Plain text password for the user
 * @param {string} accessType The type of user matching one of src/domain/constant/user
 * @returns {Promise<{"id": int,"name": string,"username": string,"password": string,"accessType": string,"status": string,"createdat": string,"updatedat": string}>}
 */
async function save(name, username, plaintextPassword, accessType) {
    let securedMasterPassword = await cryptoService.hashPassword(plaintextPassword);

    return await usersRepository.build({
        name: name,
        username: username,
        password: securedMasterPassword,
        accessType: accessType
    })
        .save();
}

module.exports.numberOfExistingMasterUsers = numberOfExistingMasterUsers;
module.exports.save = save;
