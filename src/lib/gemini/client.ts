import { env } from '@/lib/env';

const GEMINI_MODELS = {
  primary: 'gemini-2.5-flash',
  fallback: 'gemini-2.5-flash-lite',
} as const;

function getGeminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export class GeminiAPIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string; // "STOP", "MAX_TOKENS", "SAFETY", etc.
  }[];
  error?: {
    message: string;
    code: number;
  };
}

interface GenerateResult {
  text: string;
  finishReason: string;
}

async function generateWithGeminiInternal(
  prompt: string,
  model: string = GEMINI_MODELS.primary,
  maxOutputTokens: number = 3500
): Promise<GenerateResult> {
  const response = await fetch(`${getGeminiUrl(model)}?key=${env.GOOGLE_GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens,
        temperature: 0.8,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new GeminiAPIError(response.status, errorText);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new GeminiAPIError(data.error.code, data.error.message);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const finishReason = data.candidates?.[0]?.finishReason ?? 'UNKNOWN';

  if (!text) {
    throw new GeminiAPIError(500, 'No content generated');
  }

  return { text: text.trim(), finishReason };
}

/**
 * Gemini APIでテキストを生成（シンプル版）
 */
export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await generateWithGeminiInternal(prompt, GEMINI_MODELS.primary, 3500);
  return result.text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini APIでテキストを生成（リトライ機能付き）
 * - 503エラー時: 指数バックオフ（1秒→2秒→4秒）でリトライ
 * - 429エラー時: フォールバックモデルに即座に切り替え（別モデルは別クオータ）
 * - MAX_TOKENS時: より大きなトークン数で再試行
 * - 失敗時: フォールバックモデル（gemini-2.5-flash-lite）を使用
 */
export async function generateWithGeminiWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  let lastText = '';
  let delayMs = 1000;

  // Primary model with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const tokens = attempt === 0 ? 3500 : 4500;
      const result = await generateWithGeminiInternal(prompt, GEMINI_MODELS.primary, tokens);

      if (result.finishReason !== 'MAX_TOKENS') {
        return result.text;
      }

      lastText = result.text;
      console.warn(`Gemini response truncated (MAX_TOKENS), attempt ${attempt + 1}/${maxRetries}`);
    } catch (error) {
      if (error instanceof GeminiAPIError) {
        // 503: サーバー過負荷 → 指数バックオフでリトライ
        if (error.status === 503) {
          console.warn(
            `Gemini 503 error, retrying in ${delayMs}ms... (attempt ${attempt + 1}/${maxRetries})`
          );
          await sleep(delayMs);
          delayMs *= 2;
          lastError = error;
          continue;
        }
        // 429: レート制限 → 即座にフォールバックモデルへ
        if (error.status === 429) {
          console.warn('Gemini 429 rate limit, switching to fallback model...');
          lastError = error;
          break; // フォールバックモデルを試す
        }
      }
      throw error;
    }
  }

  // Fallback model
  console.warn('Primary model failed, falling back to gemini-2.5-flash-lite...');
  try {
    const result = await generateWithGeminiInternal(prompt, GEMINI_MODELS.fallback, 3500);
    return result.text;
  } catch (fallbackError) {
    // フォールバックも失敗した場合
    if (lastText) {
      // 途中まで生成されたテキストがあれば返す
      return lastText;
    }
    throw lastError ?? fallbackError;
  }
}
