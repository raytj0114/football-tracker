import { Skeleton } from '@/components/ui/skeleton';

export default function TeamLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Skeleton className="h-30 w-30" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
