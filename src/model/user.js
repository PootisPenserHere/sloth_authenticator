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
            accessType: userConstants.USER_TYPE_MASTER
        }
    });

    return response.count;
}

/**
 * Bootstrapping method to create the necessary users and align access rights when the authenticator
 * is launched
 *
 * This will only run when no master user doesn't exist in the database as this indicates that the
 * system hasn't yet been initialized
 *
 * @function
 * @name initializeUsers
 * @returns {Promise<void>}
 */
async function initializeUsers() {
    if(!await numberOfExistingMasterUsers()) {
        let masterUser = process.env.MASTER_USER || await cryptoService.secureRandomString(10);
        let masterPassword = process.env.MASTER_PASSWORD || await cryptoService.secureRandomString(10);

        let securedMasterPassword = await cryptoService.hashPassword(masterPassword);

        await usersRepository.build({
            name: 'Master user',
            username: masterUser,
            password: securedMasterPassword,
            accessType: userConstants.USER_TYPE_MASTER
        })
            .save();

        /*
         * THis is printed only to console so that the credentials aren't saved in the log files
         * or other logging platforms
         */
        console.log(`created the master user: "${masterUser}" with the password: "${masterPassword}"`)
    }
}

module.exports.numberOfExistingMasterUsers = numberOfExistingMasterUsers;
module.exports.initializeUsers = initializeUsers;
