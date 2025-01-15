'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.ENUM('author', 'cheifEditor', 'sectionHead', 'sectionhead'),
        allowNull: false,
      }, { transaction });

      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_users_role" RENAME VALUE 'sectionhead' TO 'sectionHead';`,
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.ENUM('author', 'cheifEditor', 'sectionhead'),
        allowNull: false,
      }, { transaction });

    });
  }
};
