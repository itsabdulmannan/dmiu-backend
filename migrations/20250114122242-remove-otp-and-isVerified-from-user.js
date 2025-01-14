'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'otp');
    await queryInterface.removeColumn('users', 'isVerified');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'otp', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  }
};
