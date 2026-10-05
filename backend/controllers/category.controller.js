const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body || {};

    if (!name || !slug) {
      return res.status(400).json({
        message: "Name and slug are required",
      });
    }

    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category name or slug already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({ category });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, slug, description, image, isActive } = req.body || {};

    if (slug && slug !== category.slug) {
      const existing = await Category.findOne({
        slug,
        _id: { $ne: category._id },
      });

      if (existing) {
        return res.status(409).json({
          message: "A category with this slug already exists",
        });
      }
    }

    if (name && name !== category.name) {
      const existing = await Category.findOne({
        name,
        _id: { $ne: category._id },
      });

      if (existing) {
        return res.status(409).json({
          message: "A category with this name already exists",
        });
      }
    }

    category.name = name ?? category.name;
    category.slug = slug ?? category.slug;
    category.description = description ?? category.description;
    category.image = image ?? category.image;
    category.isActive = isActive ?? category.isActive;

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
