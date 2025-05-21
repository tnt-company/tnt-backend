'use strict';

/**
 * @type {import('sequelize-cli').Migration}
 *
 * Migration to create Users table
 * Note: SQL query logging is disabled in config/sequelize-cli.js
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2, // SALES role
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create index on email for faster lookups
    await queryInterface.addIndex('Users', ['email']);

    // Create index on role for filtering by role
    await queryInterface.addIndex('Users', ['role']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
