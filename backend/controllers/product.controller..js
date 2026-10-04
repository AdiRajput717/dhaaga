const Product = require("../models/Product");
const Category = require("../models/Category");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      images,
      category,
      variants,
    } = req.body;

    if (
      !name ||
      !slug ||
      !description ||
      price === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: "Required product fields are missing",
      });
    }

    const categoryExists = await Category.findById(category);

if (!categoryExists) {
  return res.status(404).json({
    message: "Category not found",
  });
}

    const existingProduct = await Product.findOne({ slug });

    if (existingProduct) {
      return res.status(409).json({
        message: "A product with this slug already exists",
      });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      images: images || [],
      category,
      variants: variants || [],
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
  isActive: true,
})
  .populate("category")
  .sort({
    createdAt: -1,
  });

    res.status(200).json({
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
  slug: req.params.slug,
  isActive: true,
}).populate("category");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      slug,
      description,
      price,
      images,
      category,
      variants,
      isActive,
    } = req.body;

    if (slug && slug !== product.slug) {
      const existingProduct = await Product.findOne({
        slug,
        _id: { $ne: product._id },
      });

      if (existingProduct) {
        return res.status(409).json({
          message: "A product with this slug already exists",
        });
      }
    }

    product.name = name ?? product.name;
    product.slug = slug ?? product.slug;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.images = images ?? product.images;
    product.category = category ?? product.category;
    product.variants = variants ?? product.variants;
    product.isActive = isActive ?? product.isActive;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
};