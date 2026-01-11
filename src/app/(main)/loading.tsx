import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MainLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="animate-fade-in text-center">
          <p className="text-lg font-medium text-foreground">Football Tracker</p>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    </div>
  );
}
