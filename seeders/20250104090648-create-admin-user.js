'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existingChiefEditor = await queryInterface.rawSelect('users', {
      where: {
        role: process.env.ADMIN_ROLE,
      },
    }, ['id']);

    if (existingChiefEditor) {
      console.log('Chief Editor already exists, no new entry created.');
      return;
    }

    await queryInterface.bulkInsert('users', [{
      firstName: process.env.ADMIN_FIRST_NAME,
      lastName: process.env.ADMIN_LAST_NAME,
      email: process.env.ADMIN_EMAIL,
      role: process.env.ADMIN_ROLE,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'chiefEditor'
    }, {});
  }
};
