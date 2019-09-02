"use strict";

/**
 * Model for the access privileges that the client users will inherit by belonging to one of the
 * client types that are related to a service user
 *
 * @module accessPrivilegesByClientTypeModel
 */

const accessPrivilegesByClientTypeRepository = require('../repository/accessPrivilegesByClientType');
const accessPrivilegesByClientTypeConstants = require('../domain/constant/accessPrivilegesByClientType');

/**
 *
 * @function
 * @name save
 * @param idClientTypeByService
 * @param accessRight
 * @returns {Promise<*|{id: int, name: string, username: string, password: string, accessType: string, status: string, createdat: string, updatedat: string}>}
 */
async function save(idClientTypeByService, accessRight) {
    return await accessPrivilegesByClientTypeRepository.build({
        idClientTypeByService: idClientTypeByService,
        name: accessRight,
    })
        .save();
}

module.exports.save = save;
