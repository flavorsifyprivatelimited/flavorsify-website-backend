import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productsRoutes from "./routes/products.routes.js";
import adminUploadRoutes from "./routes/admin-upload.routes.js";

import { env, isProd } from './config/env.js';

import healthRoutes from './routes/health.routes.js';
import enquiryRoutes from './routes/enquiry.routes.js';

import adminAuthRoutes from './routes/admin-auth.routes.js';
import adminProductsRoutes from './routes/admin-products.routes.js';
import adminEnquiriesRoutes from './routes/admin-enquiries.routes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = [env.CLIENT_ORIGIN];

if (!isProd) {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:5174'
  );
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      cb(new Error('Origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));

// Read cookies for admin authentication
app.use(cookieParser());

// Public API routes
app.use('/api/health', healthRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use("/api/products", productsRoutes);

// Protected admin API routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/enquiries', adminEnquiriesRoutes);
app.use("/api/admin/uploads", adminUploadRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;