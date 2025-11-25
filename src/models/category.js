// const mongoose = require("mongoose");

// const categorySchema = new mongoose.Schema({
//     name: { type: String, required: true, trim: true },
//     slug: { type: String, required: true, unique: true },
//     parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
//     level: { type: Number, default: 0 },
// },{ timestamp: true });

// module.exports = mongoose.model("Category", categorySchema);


const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  image:{ type:String },
  level: { type: Number, default: 0 }
}, { timestamps: true });


// Automatically generate slug and level before saving
categorySchema.pre("validate", async function(next) {
  // Generate slug from name
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }

  // Auto calculate level based on parentId
  if (this.parentId) {
    const parentCategory = await mongoose.model("Category").findById(this.parentId);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
    }
  } else {
    this.level = 0;
  }

  next();
});

module.exports = mongoose.model("Category", categorySchema);
