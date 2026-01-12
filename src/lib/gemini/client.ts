import { env } from '@/lib/env';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
  maxOutputTokens: number = 3500
): Promise<GenerateResult> {
  const response = await fetch(`${GEMINI_API_URL}?key=${env.GOOGLE_GEMINI_API_KEY}`, {
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
  const result = await generateWithGeminiInternal(prompt, 3500);
  return result.text;
}

/**
 * Gemini APIでテキストを生成（リトライ機能付き）
 * finishReason が MAX_TOKENS の場合、より大きなトークン数で再試行
 */
export async function generateWithGeminiWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<string> {
  let lastText = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const tokens = attempt === 0 ? 3500 : 4500;
    const result = await generateWithGeminiInternal(prompt, tokens);

    if (result.finishReason !== 'MAX_TOKENS') {
      return result.text;
    }

    lastText = result.text;
    console.warn(
      `Gemini response truncated (MAX_TOKENS), attempt ${attempt + 1}/${maxRetries + 1}`
    );
  }

  // 最後の試行結果を返す（途中切断でもベストエフォートで返す）
  return lastText;
}
