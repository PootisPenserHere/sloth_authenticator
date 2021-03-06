"use strict";

const Sequelize = require('sequelize');
const postgresService = require('../service/postgres');
const clientTypesByServiceConstants = require('../domain/constant/clientTypesByService');

/* istanbul ignore next */
class ClientTypesByService extends Sequelize.Model {}

module.exports = ClientTypesByService.init({
    idService: {
        field: 'id_service',
        type: Sequelize.INTEGER,
        notNull: true,
        unique: 'compositeIndex'
    },
    name: {
        field: 'name',
        type: Sequelize.STRING,
        notNull: true,
        unique: 'compositeIndex'
    },
    status: {
        field: 'status',
        type: Sequelize.ENUM(clientTypesByServiceConstants.STATUS_ACTIVE,
            clientTypesByServiceConstants.STATUS_INACTIVE),
    },
}, {
    sequelize: postgresService.connection,
    timestamps:false, // This are handled by the database
    freezeTableName: true, // An s won't be added at the end of the table name
    modelName: 'client_types_by_service'
});
