import asyncHandler from "../../middleware/async_handler.middleware.js";
import cloudinary from "../../utils/cloudinary.utils.js";
import { Category } from "../../model/resturant/category.model.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, foodType, isAvailable } = req.body;
  const { restaurantId } = req.restaurant;

  if (!name || !description || !foodType || !isAvailable) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  const existingcat = await Category.findOne({ name });
  if (existingcat) {
    return res.status(400).json({ message: "Category already exists" });
  }
  const result = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "Category/",
      use_filename: true,
    },
    (err, resu) => {
      if (err) {
        res.status(500);
        throw new Error(`Error : ${err}`);
      }
    }
  );
  if (!result) {
    return res.status(400).json({ message: "Image not uploaded" });
  }
  const categoryImage = result.secure_url;

  const category = await Category({
    name,
    description,
    resturant: restaurantId,
    foodType,
    isAvailable,
    categoryImage,
  });
  await category.save();
  return res.status(201).json(category);
});

const getAllCategory = asyncHandler(async (req, res) => {
  let { page = 0, limit = 10 } = req.query;
  const { restaurantId } = req.restaurant;
  const skip = page * limit;
  const category = await Category.find({ resturant: restaurantId })
    .skip(skip)
    .limit(parseInt(limit));
  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }
  return res.status(200).json(category);
});

const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }
  category.isAvailable = !category.isAvailable;
  await category.save();
  return res.status(200).json({ message: "Update Availability" });
});

export { createCategory, getAllCategory, updateCategoryStatus };
