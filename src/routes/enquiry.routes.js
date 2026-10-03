import { Router } from "express";
import { z } from "zod";
import Enquiry from "../models/Enquiry.js";
import { sendEnquiryEmail } from "../services/email.service.js";

const router = Router();

const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  company: z
    .string()
    .trim()
    .optional()
    .default(""),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number"),

  product: z
    .string()
    .trim()
    .optional()
    .default(""),

  quantity: z
    .string()
    .trim()
    .optional()
    .default(""),

  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters"),
});

router.post("/", async (req, res, next) => {
  try {
    const result = enquirySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message:
          "Please check the submitted information.",

        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    /*
     * STEP 1
     * Save the enquiry to MongoDB first.
     *
     * This is the important part. Once MongoDB
     * successfully saves it, we don't want the
     * customer waiting for the email service.
     */
    const enquiry = await Enquiry.create(
      result.data
    );

    /*
     * STEP 2
     * Immediately respond to the customer.
     *
     * The enquiry is already safely stored in
     * MongoDB at this point.
     */
    res.status(201).json({
      message:
        "Enquiry submitted successfully.",

      enquiryId: enquiry._id,
    });

    /*
     * STEP 3
     * Send the notification email in the background.
     *
     * We intentionally do NOT await this.
     *
     * If the email takes 30 seconds, 1 minute,
     * etc., the customer doesn't have to wait.
     */
    sendEnquiryEmail(enquiry)
      .then(() => {
        console.log(
          "Enquiry notification email sent successfully."
        );
      })
      .catch((notificationError) => {
        console.error(
          "Email notification failed:",
          notificationError.message
        );
      });

  } catch (error) {
    next(error);
  }
});

export default router;
