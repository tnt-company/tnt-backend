const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Category name is required',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'Categories',
    hooks: {
      beforeCreate: category => {
        // Trim all string fields
        if (category.name) category.name = category.name.trim();
        if (category.description) category.description = category.description.trim();
      },
      beforeUpdate: category => {
        // Trim all string fields
        if (category.changed('name')) category.name = category.name.trim();
        if (category.changed('description')) category.description = category.description.trim();
      },
    },
  }
);

module.exports = Category;
