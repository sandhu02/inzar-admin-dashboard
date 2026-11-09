import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.string().url().default('http://localhost:8000/api/v1'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Inzar'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters for AES-256-GCM encryption')
    .default('inzar-admin-dev-secret-super-secure-32chars!'),
  NEXT_PUBLIC_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  NEXT_PUBLIC_MAP_STYLE_URL: z
    .string()
    .url()
    .default('https://demotiles.maplibre.org/style.json'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1).default('inzar-dev'),
});

const processEnv = {
  API_BASE_URL: process.env.API_BASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
};

const parsedEnv = envSchema.safeParse(processEnv);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = parsedEnv.data;
