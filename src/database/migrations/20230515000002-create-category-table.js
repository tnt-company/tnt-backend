'use strict';

/**
 * @type {import('sequelize-cli').Migration}
 *
 * Migration to create Categories table
 * Note: SQL query logging is disabled in config/sequelize-cli.js
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Categories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Create index on name for faster lookups
    await queryInterface.addIndex('Categories', ['name']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('Categories');
  },
};
