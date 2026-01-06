import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  // CI環境ではバリデーションをスキップ
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    return {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
    } as Env;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

// 後方互換性のためProxyを使用（実際のアクセス時にバリデーション）
export const env = new Proxy({} as Env, {
  get(_target, prop: keyof Env) {
    return getEnv()[prop];
  },
});
