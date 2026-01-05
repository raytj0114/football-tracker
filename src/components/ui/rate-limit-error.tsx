import { Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RateLimitErrorProps {
  returnPath?: string;
}

export function RateLimitError({ returnPath = '/' }: RateLimitErrorProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">リクエスト制限中</h2>
          <p className="mb-2 text-muted-foreground">APIリクエストの上限に達しました</p>
          <p className="mb-6 text-sm text-muted-foreground">
            60秒ほどお待ちいただいてから再度お試しください
          </p>
          <Link
            href={returnPath}
            className={cn(
              'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'bg-primary text-primary-foreground shadow hover:bg-primary/90',
              'h-10 px-4 py-2 text-sm',
              'active:scale-[0.98]'
            )}
          >
            <RefreshCw className="h-4 w-4" />
            再試行
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
