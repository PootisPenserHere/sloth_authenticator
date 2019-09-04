"use strict";

const Sequelize = require('sequelize');
const postgresService = require('../service/postgres');

/* istanbul ignore next */
class Client extends Sequelize.Model {}

module.exports = Client.init({
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
    idClientType: {
        field: 'id_client_type',
        type: Sequelize.ENUM('master', 'service'),
    },
    status: {
        field: 'status',
        type: Sequelize.ENUM('active', 'inactive'),
    },
}, {
    sequelize: postgresService.connection,
    modelName: 'client'
});
