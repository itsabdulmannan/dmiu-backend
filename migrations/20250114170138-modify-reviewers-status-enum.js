'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("ALTER TYPE enum_reviewers_status ADD VALUE 'assigned'");

    await queryInterface.changeColumn('reviewers', 'status', {
      type: Sequelize.ENUM('assigned', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'assigned',
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.changeColumn('reviewers', 'status', {
      type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },
};
