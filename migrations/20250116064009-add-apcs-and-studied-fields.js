'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('papers', 'apcs', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
        await queryInterface.addColumn('papers', 'studiedAndUnderstood', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('papers', 'apcs');
        await queryInterface.removeColumn('papers', 'studiedAndUnderstood');
    }
};
