"use strict";

/**
 * This is the api initialization, the methods contained here will be run at the start up
 * to prepare the api for the production environment
 *
 * @module bootstrapApplication
 */

const userModel = require('../model/user');
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
    let yml = await yaml.safeLoad(configFile, 'utf8');
    return yml;
}

async function initializeServices() {
    let config = await readConfigFile();
    let services = config.service;

    for (const service of services) {
        await userModel.save(
            service.name.toString(),
            service.user.toString(),
            service.password.toString(),
            userConstants.USER_TYPE_SERVICE
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
