"use strict";

/**
 * This is the api initialization, the methods contained here will be run at the start up
 * to prepare the api for the production environment
 *
 * @module bootstrapApplication
 */

const userModel = require('../model/user');
const clientTypesByServiceModel = require('../model/clientTypesByService');
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
 * @name saveClientTypesByService
 * @param {int} idService The id of the service user to whom the type of user belongs
 * @param {list} userTypes A list of strings containing the names of the user types for the service
 * @param {list} [clients] The initial clients to be crated for the given type of user
 * @returns {Promise<void>}
 */
async function saveClientTypesByService(idService, userTypes, clients) {
    for(const userType of userTypes) {
        let savedUserType = await clientTypesByServiceModel.save(
            idService,
            userType.toString(),
        );
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

        await saveClientTypesByService(savedService.id, config["clientTypes"][service.name]);
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
