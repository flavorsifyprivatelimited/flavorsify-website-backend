import { Router } from 'express';
import { z } from 'zod';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(requireAdmin);

const productSchema = z.object({
  name: z.string().trim().min(2),
  category: z.string().trim().min(2),
  description: z.string().trim().min(5),
  specifications: z.array(z.string().trim()).optional().default([]),
  imageUrl: z.string().trim().optional().default(''),
  featured: z.boolean().optional().default(false),
  status: z.enum(['Draft', 'Published']).optional().default('Draft'),
});

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Please check the product details.',
        errors: parsed.error.issues,
      });
    }

    const slug = slugify(parsed.data.name);

    if (!slug) {
      return res.status(400).json({ message: 'Please enter a valid product name.' });
    }

    const product = await Product.create({ ...parsed.data, slug });

    res.status(201).json({ message: 'Product created.', product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A product with a similar name already exists. Please use a unique name.',
      });
    }
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = productSchema.partial().safeParse(req.body);

    if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
      return res.status(400).json({ message: 'Provide valid product fields to update.' });
    }

    const updates = { ...parsed.data };

    if (updates.name) {
      updates.slug = slugify(updates.name);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product updated.', product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That product name is already in use.' });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;