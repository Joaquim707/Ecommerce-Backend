// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   brand: { type: String, required: true },

//   // Category is now a reference to Category model
//   categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

//   categoryPath: { type: String, default: "" }, // e.g., "Men > Clothing > Shirts"

//   images: {
//     type: [String],
//     default: [],
//   },

//   mrp: { type: Number, required: true },
//   price: { type: Number, required: true },
//   discountPercent: { type: Number, required: true },

//   colorOptions: { type: [String], default: [] },
//   sizeOptions: { type: [String], default: [] },

//   sizeFit: { type: String, default: "" },
//   materialCare: { type: String, default: "" },

//   specifications: { type: Object, default: {} },

//   ratings: {
//     average: { type: Number, default: 0 },
//     totalCount: { type: Number, default: 0 }
//   },
//   slug: {
//   type: String,
//   unique: true,
//   index: true
// },

//   productCode: { type: String, unique: true, required: true }

// }, { timestamps: true });

// module.exports = mongoose.model("Product", productSchema);


const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    brand: { type: String, required: true },

    // Category reference
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    categoryPath: { type: String, default: "" }, // e.g., "Men > Clothing > Shirts"

    images: {
      type: [String],
      default: [],
    },

    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, required: true },

    colorOptions: { type: [String], default: [] },
    sizeOptions: { type: [String], default: [] },

    sizeFit: { type: String, default: "" },
    materialCare: { type: String, default: "" },

    specifications: { type: Object, default: {} },

    ratings: {
      average: { type: Number, default: 0 },
      totalCount: { type: Number, default: 0 },
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    productCode: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

// ✅ FIX: Prevent OverwriteModelError
module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
