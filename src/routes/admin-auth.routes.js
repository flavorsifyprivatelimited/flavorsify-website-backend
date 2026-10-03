import { Router } from "express";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { env, isProd } from "../config/env.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Too many login attempts. Please try again later.",
  },
});

/*
  Cookie configuration

  Local development:
  - secure: false
  - sameSite: "lax"

  Production:
  - secure: true
  - sameSite: "none"

  "none" is required because the frontend
  and backend are hosted on different sites
  (Vercel + Render).
*/

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

router.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res
      .status(401)
      .json({
        message: "Invalid email or password.",
      });
  }

  // Both configured admin accounts
  const admins = [
    {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    },
    {
      email: env.ADMIN_EMAIL_2,
      password: env.ADMIN_PASSWORD_2,
    },
  ];

  // Find the account matching the submitted credentials
  const admin = admins.find(
    (account) =>
      account.email &&
      account.password &&
      account.email.toLowerCase() ===
        email.trim().toLowerCase() &&
      account.password === password
  );

  if (!admin) {
    return res
      .status(401)
      .json({
        message: "Invalid email or password.",
      });
  }

  const token = jwt.sign(
    {
      role: "admin",
      email: admin.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );

  res.cookie("flavorsify_admin", token, {
    ...cookieOptions,
    maxAge: 8 * 60 * 60 * 1000,
  });

  return res.json({
    message: "Login successful.",
    admin: {
      email: admin.email,
    },
  });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({
    admin: req.admin,
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie(
    "flavorsify_admin",
    cookieOptions
  );

  res.json({
    message: "Logged out successfully.",
  });
});

export default router;
