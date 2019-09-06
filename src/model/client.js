"use strict";

/**
 * This model contains the methods to interact with the clients table as well as to obtain information to do
 * with the client users
 *
 * @module clientModel
 */

const clientsRepository = require('../repository/clients');
const clientConstants = require('../domain/constant/client');

async function save(idUser, idClientType) {
    return await clientsRepository.build({
        idUser: idUser,
        idClientType: idClientType,
        status: clientConstants.STATUS_ACTIVE
    })
        .save();
}

module.exports.save = save;
