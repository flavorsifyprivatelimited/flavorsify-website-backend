import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import productsRoutes from './routes/products.routes.js';
import adminUploadRoutes from './routes/admin-upload.routes.js';

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

/* =========================================
   CORS
========================================= */

const allowedOrigins = [
  'https://flavorsify-website-chomfvx9g-flavorsify.vercel.app',
  env.CLIENT_ORIGIN?.trim().replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin
        .trim()
        .replace(/\/$/, '');

      console.log('CORS request from:', normalizedOrigin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error('CORS blocked origin:', normalizedOrigin);

      return callback(null, false);
    },

    credentials: true,
  })
);

/* =========================================
   BODY PARSER
========================================= */

app.use(express.json({ limit: '10kb' }));

/* =========================================
   COOKIE PARSER
========================================= */

app.use(cookieParser());

/* =========================================
   PUBLIC API ROUTES
========================================= */

app.use('/api/health', healthRoutes);

app.use('/api/enquiries', enquiryRoutes);

app.use('/api/products', productsRoutes);

/* =========================================
   PROTECTED ADMIN API ROUTES
========================================= */

app.use('/api/admin/auth', adminAuthRoutes);

app.use('/api/admin/products', adminProductsRoutes);

app.use('/api/admin/enquiries', adminEnquiriesRoutes);

app.use('/api/admin/uploads', adminUploadRoutes);

/* =========================================
   ERROR HANDLING
========================================= */

app.use(notFound);

app.use(errorHandler);

export default app;
