const Category = require("../../models/category");

async function getCategoryPath(categoryId) {
  let path = [];
  let category = await Category.findById(categoryId);

  while (category) {
    path.unshift(category.name);
    if (!category.parentId) break;
    category = await Category.findById(category.parentId);
  }

  return path.join(" > "); // Example: "Men > Clothing > Shirts"
}

module.exports = getCategoryPath;
