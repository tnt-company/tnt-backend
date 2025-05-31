'use strict';

/**
 * @type {import('sequelize-cli').Migration}
 *
 * Migration to make category_id required in Products table
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First check if there are any products with null category_id
    const productsWithNullCategory = await queryInterface.sequelize.query(
      'SELECT id FROM "Products" WHERE category_id IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (productsWithNullCategory.length > 0) {
      console.warn(`Warning: ${productsWithNullCategory.length} products have null category_id`);

      // Get the first category ID to use as default
      const categories = await queryInterface.sequelize.query(
        'SELECT id FROM "Categories" LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (categories.length === 0) {
        throw new Error('Cannot make category_id required: No categories exist in the database');
      }

      const defaultCategoryId = categories[0].id;

      // Update products with null category_id to use the default category
      await queryInterface.sequelize.query(
        `UPDATE "Products" SET category_id = '${defaultCategoryId}' WHERE category_id IS NULL`
      );
    }

    // Change column to not allow null
    await queryInterface.changeColumn('Products', 'category_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // Changed from SET NULL to RESTRICT since it's required now
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to original state - allow null values
    await queryInterface.changeColumn('Products', 'category_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
