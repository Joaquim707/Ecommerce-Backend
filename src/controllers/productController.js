const Product = require("../models/product");
const Category = require("../models/category");
const getCategoryPath = require("../utils/Product/getCategoryPath");
const generateProductCode = require("../utils/Product/generateProductCode");


const slugify = require("slugify");

exports.createProduct = async (req, res) => {
  try {
    // if (!req.body.images || req.body.images.length < 1) {
    //   return res.status(400).json({ message: "Minimum 1 images required" });
    // }

    // Create slug from title
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });

    // Generate Product Code
    req.body.productCode = await generateProductCode(req.body.categoryId);

    // Generate Category Path
    req.body.categoryPath = await getCategoryPath(req.body.categoryId);

    const product = await Product.create(req.body);

    return res.status(201).json({
      ok: true,
      message: "Product Created Successfully",
      product
    });

  } catch (error) {
    console.error("Create Product Error:", error);

    // Duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({
        ok: false,
        message: "Slug already exists. Change product name.",
      });
    }

    return res.status(500).json({ message: "Server Error", error });
  }
};

// GET ALL PRODUCTS (with pagination + sorting)
exports.getAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 20, sort } = req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    let sortOption = {};
    switch (sort) {
      case "price_low_to_high":
        sortOption.price = 1;
        break;
      case "price_high_to_low":
        sortOption.price = -1;
        break;
      case "rating_high_to_low":
        sortOption["ratings.average"] = -1;
        break;
      case "newest":
      default:
        sortOption.createdAt = -1;
    }

    const products = await Product.find({})
      .populate("categoryId", "name slug parentId") // Include category details
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments();

    return res.json({
      ok: true,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      pageSize: products.length,
      products
    });

  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate("categoryId", "name slug parentId");

    if (!product) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    return res.json({ ok: true, product });

  } catch (error) {
    console.error("Get Product By ID Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ ok: false, message: "Invalid Product ID" });
    }

    return res.status(500).json({ ok: false, message: "Server error" });
  }
};


exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate("categoryId", "name slug parentId");

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      ok: true,
      product,
    });

  } catch (error) {
    console.log("Get Product by Slug Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Server Error",
    });
  }
};



// FILTER PRODUCTS
// exports.getFilteredProducts = async (req, res) => {
//   try {
//     let {
//       brand,
//       color,
//       size,
//       categoryId,
//       minPrice,
//       maxPrice,
//       minDiscount,
//       search,
//       sort,
//       page = 1,
//       limit = 20
//     } = req.query;

//     let filter = {};

//     // Category Filter
//     if (categoryId) {
//       filter.categoryId = categoryId;
//     }

//     // ✅ Brand filter (supports both array & comma string)
//     if (brand) {
//       const brandArray = Array.isArray(brand) ? brand : brand.split(",");
//       filter.brand = { $in: brandArray.map(b => new RegExp(`^${b}$`, "i")) };
//     }

//     // ✅ Color filter (supports both array & comma string)
//     if (color) {
//       const colorArray = Array.isArray(color) ? color : color.split(",");
//       filter.colorOptions = { $in: colorArray.map(c => new RegExp(`^${c}$`, "i")) };
//     }

//     // ✅ Size filter (supports both array & comma string)
//     if (size) {
//       const sizeArray = Array.isArray(size) ? size : size.split(",");
//       filter.sizeOptions = { $in: sizeArray.map(s => new RegExp(`^${s}$`, "i")) };
//     }

//     // ✅ Price filter
//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = Number(minPrice);
//       if (maxPrice) filter.price.$lte = Number(maxPrice);
//     }

//     // ✅ Discount filter
//     if (minDiscount) {
//       filter.discountPercent = { $gte: Number(minDiscount) };
//     }

//     // ✅ Search filter
//     if (search) {
//       const searchRegex = { $regex: search, $options: "i" };
//       filter.$or = [
//         { title: searchRegex },
//         { brand: searchRegex },
//         { categoryPath: searchRegex },
//         { colorOptions: searchRegex },
//         { sizeOptions: searchRegex }
//       ];
//     }

//     // Pagination
//     const skip = (page - 1) * limit;

//     // Sorting
//     let sortOption = {};
//     switch (sort) {
//       case "price_low_to_high":
//         sortOption.price = 1;
//         break;
//       case "price_high_to_low":
//         sortOption.price = -1;
//         break;
//       case "rating_high_to_low":
//         sortOption["ratings.average"] = -1;
//         break;
//       default:
//         sortOption.createdAt = -1;
//     }

//     // Fetch Products
//     const products = await Product.find(filter)
//       .populate("categoryId", "name slug parentId")
//       .sort(sortOption)
//       .skip(skip)
//       .limit(Number(limit));

//     const totalProducts = await Product.countDocuments(filter);

//     return res.json({
//       ok: true,
//       totalProducts,
//       totalPages: Math.ceil(totalProducts / limit),
//       currentPage: Number(page),
//       products
//     });

//   } catch (error) {
//     console.log("Filter API Error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

exports.getFilteredProducts = async (req, res) => {
  try {
    let {
      brand,
      color,
      size,
      categoryId,
      minPrice,
      maxPrice,
      minDiscount,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    let filter = {};

    // ✅ Category Filter
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // ✅ Brand Filter
    if (brand) {
      const brandArray = Array.isArray(brand) ? brand : brand.split(",");
      filter.brand = { $in: brandArray.map(b => new RegExp(`^${b}$`, "i")) };
    }

    // ✅ Color Filter
    if (color) {
      const colorArray = Array.isArray(color) ? color : color.split(",");
      filter.colorOptions = { $in: colorArray.map(c => new RegExp(`^${c}$`, "i")) };
    }

    // ✅ Size Filter
    if (size) {
      const sizeArray = Array.isArray(size) ? size : size.split(",");
      filter.sizeOptions = { $in: sizeArray.map(s => new RegExp(`^${s}$`, "i")) };
    }

    // ✅ Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ✅ Discount Filter
    if (minDiscount) {
      filter.discountPercent = { $gte: Number(minDiscount) };
    }

    // ✅ Search Filter
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { categoryPath: searchRegex },
        { colorOptions: searchRegex },
        { sizeOptions: searchRegex }
      ];
    }

    // ✅ Pagination
    const skip = (page - 1) * limit;

    // ✅ Sorting Options
    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption.createdAt = -1;
        break;
      case "oldest":
        sortOption.createdAt = 1;
        break;
      case "price_low_to_high":
        sortOption.price = 1;
        break;
      case "price_high_to_low":
        sortOption.price = -1;
        break;
      case "rating_high_to_low":
        sortOption["ratings.average"] = -1;
        break;
      case "discount_high_to_low":
        sortOption.discountPercent = -1;
        break;
      default:
        sortOption.createdAt = -1; // fallback: latest first
    }

    // ✅ Fetch Products
    const products = await Product.find(filter)
      .populate("categoryId", "name slug parentId")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(filter);

    // ✅ Response
    return res.json({
      ok: true,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      products,
      totalProducts,
    });

  } catch (error) {
    console.error("Filter API Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.addImagesToProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Ensure images were uploaded
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "At least 1 image is required" });
    }

    // Convert file paths to URLs
    const newImages = req.files.map(file =>
      `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    // Update product and push new images to array
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $push: { images: { $each: newImages } } },
      { new: true } // Return updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      ok: true,
      message: "Images added successfully",
      updatedProduct
    });

  } catch (error) {
    console.error("Add Images Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 20,
      sort,
      brand,
      color,
      size,
      minPrice,
      maxPrice,
      minDiscount,
      search
    } = req.query;

    // ✅ Find category by slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ ok: false, message: "Category not found" });
    }

    // ✅ Collect category + subcategories
    const subcategories = await Category.find({ parentId: category._id });
    const categoryIds = [category._id, ...subcategories.map(c => c._id)];

    let filter = { categoryId: { $in: categoryIds } };

    // ✅ Safe Brand Filter
    if (brand) {
      let brandArray = [];
      if (Array.isArray(brand)) {
        brandArray = brand;
      } else if (typeof brand === "string") {
        brandArray = brand.split(",");
      } else if (brand != null) {
        brandArray = [String(brand)];
      }

      filter.brand = { $in: brandArray.map(b => new RegExp(`^${b}$`, "i")) };
    }

    // ✅ Safe Color Filter
    if (color) {
      let colorArray = [];
      if (Array.isArray(color)) {
        colorArray = color;
      } else if (typeof color === "string") {
        colorArray = color.split(",");
      } else if (color != null) {
        colorArray = [String(color)];
      }

      filter.colorOptions = { $in: colorArray.map(c => new RegExp(`^${c}$`, "i")) };
    }

    // ✅ Safe Size Filter
    if (size) {
      let sizeArray = [];
      if (Array.isArray(size)) {
        sizeArray = size;
      } else if (typeof size === "string") {
        sizeArray = size.split(",");
      } else if (size != null) {
        sizeArray = [String(size)];
      }

      filter.sizeOptions = { $in: sizeArray.map(s => new RegExp(`^${s}$`, "i")) };
    }

    // ✅ Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ✅ Discount Filter
    if (minDiscount) {
      filter.discountPercent = { $gte: Number(minDiscount) };
    }

    // ✅ Search Filter
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { colorOptions: searchRegex },
        { sizeOptions: searchRegex }
      ];
    }

    // ✅ Sorting
    let sortOption = {};
    switch (sort) {
      case "price_low_to_high":
        sortOption.price = 1;
        break;
      case "price_high_to_low":
        sortOption.price = -1;
        break;
      case "rating_high_to_low":
        sortOption["ratings.average"] = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }

    // ✅ Pagination
    const skip = (page - 1) * Number(limit);

    const products = await Product.find(filter)
      .populate("categoryId", "name slug parentId")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(filter);

    return res.json({
      ok: true,
      category: category.name,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      products
    });

  } catch (error) {
    console.error("Get Products By Category Slug Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};


exports.getAllColors = async (req, res) => {
  try {
    // Get all products and return only colorOptions field
    const products = await Product.find({}, "colorOptions");

    // Flatten nested arrays & remove duplicates
    const colors = [
      ...new Set(products.flatMap((p) => p.colorOptions))
    ];

    return res.json({ ok: true, colors });

  } catch (error) {
    console.error("Get Colors Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.getProductsByLastCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // Convert "T-Shirts" → "t-shirts"
    const slug = slugify(categoryName, { lower: true, strict: true });

    // Find category by slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        ok: false,
        message: "Category not found",
      });
    }

    // Fetch products from same category
    const products = await Product.find({ categoryId: category._id })
      .populate("categoryId", "name slug parentId")
      .limit(16);

    return res.json({
      ok: true,
      products,
    });

  } catch (error) {
    console.error("Similar Products Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Server Error",
    });
  }
};
