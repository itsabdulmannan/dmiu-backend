'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('papers', 'paperStatus', {
      type: Sequelize.ENUM('submitted', 'published', 'rejected', 'underReview'),
      allowNull: false,
      defaultValue: 'submitted',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('papers', 'paperStatus', {
      type: Sequelize.ENUM('submitted', 'underReview', 'accepted', 'rejected', 'pending'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },
};
