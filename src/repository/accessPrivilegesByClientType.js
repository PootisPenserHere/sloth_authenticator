"use strict";

const Sequelize = require('sequelize');
const postgresService = require('../service/postgres');

/* istanbul ignore next */
class accessPrivilegesByClientType extends Sequelize.Model {}

module.exports = accessPrivilegesByClientType.init({
    idClientTypeByService: {
        field: 'id_client_type_by_service',
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
        type: Sequelize.ENUM('active', 'inactive'),
    },
}, {
    sequelize: postgresService.connection,
    timestamps:false, // This are handled by the database
    //freezeTableName: true, // An s won't be added at the end of the table name
    modelName: 'access_privileges_by_client_types'
});
