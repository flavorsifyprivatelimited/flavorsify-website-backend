import { Router } from 'express';
import { z } from 'zod';
import Enquiry from '../models/Enquiry.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(requireAdmin);

const enquirySchema = z.object({
  name: z.string().trim().min(2),
  company: z.string().trim().optional().default(''),
  email: z.email().trim(),
  phone: z.string().trim().min(7),
  product: z.string().trim().optional().default(''),
  quantity: z.string().trim().optional().default(''),
  message: z.string().trim().min(5),
  status: z.enum(['New', 'Contacted', 'Closed']).optional().default('New'),
});

const enquiryUpdateSchema = enquirySchema.partial();

router.get('/', async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ enquiries });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = enquirySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Please check the enquiry details.',
        errors: parsed.error.issues,
      });
    }

    const enquiry = await Enquiry.create(parsed.data);

    res.status(201).json({ message: 'Enquiry created.', enquiry });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = enquiryUpdateSchema.safeParse(req.body);

    if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
      return res.status(400).json({ message: 'Provide valid enquiry fields to update.' });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.json({ message: 'Enquiry updated.', enquiry });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.json({ message: 'Enquiry deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;