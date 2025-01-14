'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('papers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      manuScriptTitle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      manuScriptType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      runningTitle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      abstract: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      correspondingAuthorName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      correspondingAuthorEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      noOfAuthors: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      authors: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      reviewers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      authorsConflict: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dataAvailability: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mainManuscript: {
        type: Sequelize.STRING,
        allowNull: false
      },
      coverLetter: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supplementaryFile: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paperStatus: {
        type: Sequelize.ENUM('submitted', 'underReview', 'accepted', 'rejected', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      statusHistory: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('papers');
  }
};
