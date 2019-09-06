"use strict";

/**
 * This is the api initialization, the methods contained here will be run at the start up
 * to prepare the api for the production environment
 *
 * @module bootstrapApplication
 */

const userModel = require('../model/user');
const clientModel = require('../model/client');
const clientTypesByServiceModel = require('../model/clientTypesByService');
const accessPrivilegesByClientTypeModel = require('../model/accessPrivilegesByClientType');
const userConstants = require('../domain/constant/user');
const cryptoService = require('../service/crypto');
const yaml = require('js-yaml');

const fileService = require('../service/file');

/**
 * Reads the config file that contains the service users, client types, access rights, and
 * initial client credentials
 *
 * @function
 * @name readConfigFile
 * @returns {Promise<*>}
 */
async function readConfigFile() {
    let configFile = await fileService.readFile('/authenticator-init/config.yml');
    return await yaml.safeLoad(configFile, 'utf8');
}

/**
 * Creates the types of client that the service user has as well as their related clients
 *
 * @function
 * @name configureService
 * @param {int} idService The id of the service user to whom the type of user belongs
 * @param {array} clientTypes A list of strings containing the names of the user types for the service
 * @param {Array.<Object>} [accessRightForService] a list of objects containing the types of access privileges for the client
 * @param {Array.<Object>} [clients]
 * @returns {Promise<void>}
 */
async function configureService(idService, clientTypes, accessRightForService = null, clients = null) {
    // Save each of the client types for the service
    for(const clientType of clientTypes) {
        let savedClientType = await clientTypesByServiceModel.save(idService, clientType.toString());

        // Save the access rights for the client type
        for(const accessRight of accessRightForService[clientType]) {
            await accessPrivilegesByClientTypeModel.save(savedClientType.id, accessRight)
        }

        // Saving the client as a new user
        for(const client of clients) {
            if(client.type === clientType) {
                let clientData = await userModel.save(
                    client.name.toString(),
                    client.user.toString(),
                    client.password.toString(),
                    userConstants.USER_TYPE_CLIENT
                );

                await clientModel.save(clientData.id, savedClientType.id);
            }
        }
    }
}

/**
 * Initiates the chain to create the users for the services and their related actions
 *
 * @function
 * @name initializeServices
 * @returns {Promise<void>}
 */
async function initializeServices() {
    let config = await readConfigFile();

    for (const service of config.service) {

        let savedService = await userModel.save(
            service.name.toString(),
            service.user.toString(),
            service.password.toString(),
            userConstants.USER_TYPE_SERVICE
        );

        await configureService(
            savedService.id,
            config["clientTypes"][service.name],
            config["accessPrivilegesPerClientType"][service.name],
            config["clients"][service.name]
        );
    }

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
    if(!await userModel.numberOfExistingMasterUsers()) {
        let masterUser = process.env.MASTER_USER || await cryptoService.secureRandomString(10);
        let masterPassword = process.env.MASTER_PASSWORD || await cryptoService.secureRandomString(10);

        await userModel.save(
            'Master user',
            masterUser,
            masterPassword,
            userConstants.USER_TYPE_MASTER
        );

        /*
         * THis is printed only to console so that the credentials aren't saved in the log files
         * or other logging platforms
         */
        console.log(`created the master user: "${masterUser}" with the password: "${masterPassword}"`)

         await initializeServices();
    }
}

module.exports.initializeUsers = initializeUsers;
