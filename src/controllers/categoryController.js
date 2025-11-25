const Category = require("../models/category");
const Product = require("../models/product");
const slugify = require("slugify");

exports.createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const slug = slugify(name, { lower: true });

    let level = 0;

    // If category has a parent → level = parent's level + 1
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }
      level = parentCategory.level + 1;
    }

    const newCategory = new Category({
      name,
      slug,
      parentId: parentId || null,
      level,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Recursive function to add children
async function addChildren(category) {
  const children = await Category.find({ parentId: category._id });
  const childrenWithNested = await Promise.all(
    children.map(async (child) => await addChildren(child))
  );
  return { ...category._doc, children: childrenWithNested };
}

// exports.getAllCategories = async (req, res) => {
//   try {
//     const categories = await Category.find().sort({ level: 1, name: 1 });

//     // Group categories by level
//     const grouped = {};
//     categories.forEach(cat => {
//       const levelKey = `level${cat.level}`;
//       if (!grouped[levelKey]) grouped[levelKey] = [];
//       grouped[levelKey].push(cat);
//     });

//     // Add children to level0 categories (optional: can add for all levels if needed)
//     const level0WithChildren = await Promise.all(
//       (grouped.level0 || []).map(async (cat) => await addChildren(cat))
//     );

//     return res.json({
//       ok: true,
//       categories: grouped,
//       tree: level0WithChildren // nested children tree starting from level0
//     });

//   } catch (error) {
//     console.error("Get Categories Error:", error);
//     return res.status(500).json({
//       ok: false,
//       message: "Server Error"
//     });
//   }
// };

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ level: 1, name: 1 });

    // Attach absolute image URLs
    const formattedCategories = categories.map(cat => ({
      ...cat._doc,
      image: cat.image
        ? `${req.protocol}://${req.get("host")}${cat.image.startsWith("/") ? "" : "/"}${cat.image}`
        : null,
    }));

    // Group by level
    const grouped = {};
    formattedCategories.forEach(cat => {
      const levelKey = `level${cat.level}`;
      if (!grouped[levelKey]) grouped[levelKey] = [];
      grouped[levelKey].push(cat);
    });

    // Create tree structure for level0
    const level0WithChildren = await Promise.all(
      (grouped.level0 || []).map(async (cat) => await addChildren(cat))
    );

    return res.json({
      ok: true,
      categories: grouped,
      tree: level0WithChildren,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ ok: false, message: "Server Error" });
  }
};

async function getAllSubCategoryIds(categoryId) {
  const categories = await Category.find({ parentId: categoryId }).select("_id");
  let ids = categories.map(cat => cat._id.toString());

  for (let cat of categories) {
    ids = ids.concat(await getAllSubCategoryIds(cat._id));
  }
  return ids;
}

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Get all children category IDs also
    const subCategoryIds = await getAllSubCategoryIds(categoryId);
    subCategoryIds.push(categoryId); // include parent itself

    const products = await Product.find({ category: { $in: subCategoryIds } });

    return res.json({
      ok: true,
      total: products.length,
      products
    });

  } catch (error) {
    console.error("Get Products by Category Error:", error);
    return res.status(500).json({ ok: false, message: "Server Error" });
  }
};

exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const subIds = await getAllSubCategoryIds(category._id);
    subIds.push(category._id);

    const products = await Product.find({ category: { $in: subIds } });

    res.json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get level-1 subcategories of a root category
// exports.getSubCategories = async (req, res) => {
//   try {
//     const { mainSlug } = req.params;

//     // Find category by slug (don't force level)
//     const mainCategory = await Category.findOne({ slug: mainSlug });
//     if (!mainCategory) {
//       return res.status(404).json({ ok: false, message: "Main category not found" });
//     }

//     // Get only direct children (level + 1)
//     const subCategories = await Category.find({ parentId: mainCategory._id });

//     return res.json({
//       ok: true,
//       mainCategory: mainCategory.name,
//       subCategories,
//     });

//   } catch (error) {
//     console.log("Get SubCategories Error:", error);
//     return res.status(500).json({ ok: false, message: "Server Error" });
//   }
// };

// exports.getSubCategories = async (req, res) => {
//   try {
//     const { mainSlug } = req.params;

//     const mainCategory = await Category.findOne({ slug: mainSlug });
//     if (!mainCategory) {
//       return res.status(404).json({ ok: false, message: "Main category not found" });
//     }

//     const subCategories = await Category.find({ parentId: mainCategory._id });

//     // Include absolute image URLs
//     const formattedSubCategories = subCategories.map(sub => ({
//       ...sub._doc,
//       image: sub.image
//         ? `${req.protocol}://${req.get("host")}${sub.image.startsWith("/") ? "" : "/"}${sub.image}`
//         : null,
//     }));

//     return res.json({
//       ok: true,
//       mainCategory: mainCategory.name,
//       subCategories: formattedSubCategories,
//     });
//   } catch (error) {
//     console.log("Get SubCategories Error:", error);
//     return res.status(500).json({ ok: false, message: "Server Error" });
//   }
// };

exports.getSubCategories = async (req, res) => {
  try {
    const { mainSlug } = req.params;

    const mainCategory = await Category.findOne({ slug: mainSlug });
    if (!mainCategory) {
      return res.status(404).json({ ok: false, message: "Main category not found" });
    }

    const subCategories = await Category.find({ parentId: mainCategory._id });

    // ✅ Fix duplicate localhost issue
    const formattedSubCategories = subCategories.map(sub => {
      let imageUrl = sub.image || null;
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `${req.protocol}://${req.get("host")}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
      }
      return { ...sub._doc, image: imageUrl };
    });

    return res.json({
      ok: true,
      mainCategory: mainCategory.name,
      subCategories: formattedSubCategories,
    });
  } catch (error) {
    console.error("Get SubCategories Error:", error);
    return res.status(500).json({ ok: false, message: "Server Error" });
  }
};


// exports.addImageToCategory = async (req, res) => {
//   try {
//     const categoryId = req.params.id;

//     // Ensure at least one file is uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "Please upload an image" });
//     }

//     // Create full URL for the uploaded image
//     const imageUrl = `${req.protocol}://${req.get("host")}/uploads/categories/${req.file.filename}`;

//     // Update the category with the new image
//     const updatedCategory = await Category.findByIdAndUpdate(
//       categoryId,
//       { image: imageUrl },
//       { new: true }
//     );

//     if (!updatedCategory) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     return res.status(200).json({
//       ok: true,
//       message: "Category image added successfully",
//       category: updatedCategory,
//     });
//   } catch (error) {
//     console.error("Add Category Image Error:", error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

// ✅ Add / Update Image for Category
exports.addImageToCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Full image URL
    const imageUrl = `/uploads/categories/${req.file.filename}`;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { image: imageUrl },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      ok: true,
      message: "Category image added successfully",
      category: {
        ...updatedCategory._doc,
        image: `${req.protocol}://${req.get("host")}${imageUrl}`,
      },
    });
  } catch (error) {
    console.error("Add Category Image Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};