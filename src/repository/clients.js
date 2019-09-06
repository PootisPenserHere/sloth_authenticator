"use strict";

const Sequelize = require('sequelize');
const postgresService = require('../service/postgres');

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
        type: Sequelize.ENUM('active', 'inactive'),
    },
}, {
    sequelize: postgresService.connection,
    timestamps:false, // This are handled by the database
    modelName: 'client'
});
