'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('reviewers', 'userId', 'sectionHeadId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('reviewers', 'sectionHeadId', 'userId');
  }
};
