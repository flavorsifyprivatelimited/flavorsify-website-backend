import { Router } from "express";
import multer from "multer";
import { Readable } from "node:stream";

import cloudinary from "../config/cloudinary.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG, and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

router.post(
  "/image",
  requireAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image to upload.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "flavorsify/products",
            resource_type: "image",
          },
          (error, uploadedImage) => {
            if (error) {
              return reject(error);
            }

            resolve(uploadedImage);
          }
        );

        Readable.from(req.file.buffer).pipe(uploadStream);
      });

      return res.status(201).json({
        message: "Image uploaded successfully.",
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;