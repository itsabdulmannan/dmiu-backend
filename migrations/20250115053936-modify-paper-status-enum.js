'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('papers', 'paperStatus', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_papers_paperStatus";',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'CREATE TYPE "enum_papers_paperStatus" AS ENUM(\'submitted\', \'underReview\', \'published\', \'rejected\');',
        { transaction }
      );

      await queryInterface.addColumn(
        'papers',
        'paperStatus',
        {
          type: Sequelize.ENUM('submitted', 'underReview', 'published', 'rejected'),
          allowNull: false,
          defaultValue: 'submitted',
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('papers', 'paperStatus', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_papers_paperStatus";',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'CREATE TYPE "enum_papers_paperStatus" AS ENUM(\'submitted\', \'underReview\', \'accepted\', \'rejected\', \'pending\');',
        { transaction }
      );

      await queryInterface.addColumn(
        'papers',
        'paperStatus',
        {
          type: Sequelize.ENUM('submitted', 'underReview', 'accepted', 'rejected', 'pending'),
          allowNull: false,
          defaultValue: 'submitted',
        },
        { transaction }
      );
    });
  },
};
