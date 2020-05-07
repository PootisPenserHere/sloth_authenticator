"use strict";

const Sequelize = require('sequelize');

const postgresService = require('../service/postgres');
const userConstants = require('../domain/constant/user');

/* istanbul ignore next */
class User extends Sequelize.Model {}

/**
 * @throws TypeError
 */
module.exports = User.init({
    name: {
        field: 'name',
        type: Sequelize.STRING,
        notNull: true
    },
    username: {
        field: 'username',
        type: Sequelize.STRING,
        notNull: true,
        unique: true
    },
    password: {
        field: 'password',
        type: Sequelize.STRING,
        notNull: true
    },
    accessType: {
        field: 'access_type',
        type: Sequelize.ENUM(userConstants.TYPE_MASTER, userConstants.TYPE_SERVICE, userConstants.TYPE_CLIENT),
    },
    status: {
        field: 'status',
        type: Sequelize.ENUM(userConstants.STATUS_ACTIVE, userConstants.STATUS_INACTIVE),
    },
}, {
    sequelize: postgresService.connection,
    timestamps:false, // This are handled by the database
    modelName: 'user'
});
