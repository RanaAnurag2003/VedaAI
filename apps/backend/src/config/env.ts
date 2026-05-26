import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];
for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  HUGGINGFACE_API_KEY: z.string().optional(),
  HUGGINGFACE_MODEL: z.string().default('gpt2'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().default('./uploads'),
});

export type Env = z.infer<typeof envSchema>;


function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    console.error('Invalid environment variables:', errors);
    process.exit(1);
  }
  
  const data = parsed.data;
  if (!data.OPENAI_API_KEY && !data.GEMINI_API_KEY && !data.HUGGINGFACE_API_KEY) {
    console.warn('\n⚠️ No AI API keys (OPENAI_API_KEY, GEMINI_API_KEY, or HUGGINGFACE_API_KEY) are configured.');
    console.warn('   The application will fallback to generating mock papers for development.');
  }
  
  return data;
}

export const env = loadEnv();
