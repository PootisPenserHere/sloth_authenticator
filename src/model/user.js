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

module.exports.numberOfExistingMasterUsers = numberOfExistingMasterUsers;
