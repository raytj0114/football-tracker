'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isRateLimit = error.message.includes('429') || error.message.includes('Too Many Requests');

  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          {isRateLimit ? (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">リクエスト制限中</h2>
              <p className="mb-2 text-muted-foreground">APIリクエストの上限に達しました</p>
              <p className="mb-6 text-sm text-muted-foreground">
                60秒ほどお待ちいただいてから再度お試しください
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">エラーが発生しました</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                データの読み込み中に問題が発生しました
              </p>
            </>
          )}
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            再試行
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
