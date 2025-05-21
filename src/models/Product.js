const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define(
  'Product',
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
          msg: 'Product name is required',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      field: 'image_urls',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    salesPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'sales_price',
      validate: {
        isDecimal: {
          msg: 'Sales price must be a decimal number',
        },
        min: {
          args: [0],
          msg: 'Sales price must be greater than or equal to 0',
        },
      },
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'cost_price',
      validate: {
        isDecimal: {
          msg: 'Cost price must be a decimal number',
        },
        min: {
          args: [0],
          msg: 'Cost price must be greater than or equal to 0',
        },
      },
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'Products',
  }
);

// Define association with Category model - this will be set up in models/index.js
// Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = Product;
