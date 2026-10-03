import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import productsRoutes from "./routes/products.routes.js";
import adminUploadRoutes from "./routes/admin-upload.routes.js";

import { env, isProd } from "./config/env.js";

import healthRoutes from "./routes/health.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";

import adminAuthRoutes from "./routes/admin-auth.routes.js";
import adminProductsRoutes from "./routes/admin-products.routes.js";
import adminEnquiriesRoutes from "./routes/admin-enquiries.routes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = new Set([
  env.CLIENT_ORIGIN,

  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header
      // such as direct API/browser requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.error(
        "CORS blocked origin:",
        origin
      );

      return callback(
        new Error("Origin not allowed")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| Body parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10kb",
  })
);

/*
|--------------------------------------------------------------------------
| Cookies
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Public API routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/enquiries",
  enquiryRoutes
);

app.use(
  "/api/products",
  productsRoutes
);

/*
|--------------------------------------------------------------------------
| Protected admin API routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

app.use(
  "/api/admin/products",
  adminProductsRoutes
);

app.use(
  "/api/admin/enquiries",
  adminEnquiriesRoutes
);

app.use(
  "/api/admin/uploads",
  adminUploadRoutes
);

/*
|--------------------------------------------------------------------------
| Error handling
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

export default app;
