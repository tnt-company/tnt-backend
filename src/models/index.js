const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');

// Define model associations here
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

module.exports = {
  User,
  Category,
  Product,
};
