const Product = require("../../models/product");

async function generateProductCode(categoryId) {
  // Use last 3 characters of categoryId as prefix (or adjust how you want it)
  const prefix = categoryId.slice(-3).toUpperCase();

  const count = await Product.countDocuments({ categoryId });

  return `${prefix}-${String(count + 1).padStart(6, "0")}`;
}

module.exports = generateProductCode;
