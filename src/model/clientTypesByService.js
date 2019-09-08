"use strict";

/**
 * Model for the service types belonging to a service user, this types are the semantic ordering tha
 * the clients registered under the service user will have
 *
 * @module clientTypesByServiceModel
 */

const clientTypesByServiceRepository = require('../repository/clientTypesByService');
const clientTypesByServiceConstants = require('../domain/constant/clientTypesByService');

/**
 * Saves a new client type for a specified service user
 *
 * @function
 * @name save
 * @param idService
 * @param clientType
 * @returns {Promise<*|{id: int, name: string, username: string, password: string, accessType: string, status: string, createdat: string, updatedat: string}>}
 */
async function save(idService, clientType) {
    return await clientTypesByServiceRepository.build({
        idService: idService,
        name: clientType,
    })
        .save();
}

module.exports.save = save;
