import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables dynamically
dotenv.config({ path: path.join(process.cwd(), 'src/.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
    MONGODB_URI: z.string().url(),
    JWT_SECRET: z.string().min(32),
    PORT: z.string().default('3000'),
});

export const env = envSchema.parse(process.env);
