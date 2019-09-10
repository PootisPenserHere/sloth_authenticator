"use strict";

const Sequelize = require('sequelize');
const postgresService = require('../service/postgres');
const clientConstants = require('../domain/constant/client');

/* istanbul ignore next */
class Client extends Sequelize.Model {}

module.exports = Client.init({
    idUser: {
        field: 'id_user',
        type: Sequelize.INTEGER,
        notNull: true,
        unique: 'compositeIndex'
    },
    idClientType: {
        field: 'id_client_type',
        type: Sequelize.INTEGER,
        notNull: true,
        unique: 'compositeIndex'
    },
    status: {
        field: 'status',
        type: Sequelize.ENUM(clientConstants.STATUS_ACTIVE, clientConstants.STATUS_INACTIVE),
    },
}, {
    sequelize: postgresService.connection,
    timestamps:false, // This are handled by the database
    modelName: 'client'
});
