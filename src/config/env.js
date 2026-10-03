import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    CLIENT_ORIGIN: z.url(),
    MONGODB_URI: z.string().min(1),

    SMTP_USER: z.email().optional(),
    SMTP_APP_PASSWORD: z.string().optional(),
    ENQUIRY_NOTIFY_EMAIL: z.email().default('flavorsifyprivatelimited@gmail.com'),

    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(12),

    ADMIN_EMAIL_2: z.email().optional(),
    ADMIN_PASSWORD_2: z.string().min(12).optional(),

    JWT_SECRET: z.string().min(32),
    
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    const hasSecondEmail = Boolean(data.ADMIN_EMAIL_2);
    const hasSecondPassword = Boolean(data.ADMIN_PASSWORD_2);

    if (hasSecondEmail !== hasSecondPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Set both ADMIN_EMAIL_2 and ADMIN_PASSWORD_2 for the second admin.',
        path: ['ADMIN_EMAIL_2'],
      });
    }
  });

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:');
  for (const issue of result.error.issues) {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = result.data;
export const isProd = env.NODE_ENV === 'production';