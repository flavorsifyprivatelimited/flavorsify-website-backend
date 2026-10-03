import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

// Public catalogue: published products only
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find({ status: "Published" })
      .sort({ featured: -1, createdAt: -1 })
      .select("name slug category description specifications imageUrl featured status");

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// Public product details by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "Published",
    }).select(
      "name slug category description specifications imageUrl featured status"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;