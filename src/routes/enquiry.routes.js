import { Router } from 'express';
import { z } from 'zod';
import Enquiry from '../models/Enquiry.js';
import { sendEnquiryEmail } from '../services/email.service.js';

const router = Router();

const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  company: z.string().trim().optional().default(''),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().min(7, 'Enter a valid phone number'),
  product: z.string().trim().optional().default(''),
  quantity: z.string().trim().optional().default(''),
  message: z.string().trim().min(5, 'Message must be at least 5 characters'),
});

router.post('/', async (req, res, next) => {
  try {
    const result = enquirySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Please check the submitted information.',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Save first: the enquiry remains in MongoDB even if email fails.
    const enquiry = await Enquiry.create(result.data);

    let emailSent = false;

    try {
      await sendEnquiryEmail(enquiry);
      emailSent = true;
    } catch (notificationError) {
      console.error('Email notification failed:', notificationError.message);
    }

    return res.status(201).json({
      message: 'Enquiry submitted successfully.',
      enquiryId: enquiry._id,
      notification: {
        emailSent,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;