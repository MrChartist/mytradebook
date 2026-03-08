import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-8 w-32 shimmer-skeleton" /><Skeleton className="h-4 w-48 shimmer-skeleton" /></div>
        <Skeleton className="h-9 w-64 shimmer-skeleton" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-[1.25rem] shimmer-skeleton" />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-[1.25rem] shimmer-skeleton" />)}
      </div>
      <Skeleton className="h-72 rounded-[1.25rem] shimmer-skeleton" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-[1.25rem] shimmer-skeleton" /><Skeleton className="h-64 rounded-[1.25rem] shimmer-skeleton" />
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-[1.25rem] shimmer-skeleton" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-96 rounded-[1.25rem] shimmer-skeleton" />
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-[1.25rem] shimmer-skeleton" /><Skeleton className="h-48 rounded-[1.25rem] shimmer-skeleton" />
        </div>
      </div>
    </div>
  );
}

export function WatchlistSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-8 w-32 shimmer-skeleton" /><Skeleton className="h-4 w-48 shimmer-skeleton" /></div>
        <Skeleton className="h-9 w-28 shimmer-skeleton" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-[1.25rem] shimmer-skeleton" />)}
        </div>
        <Skeleton className="lg:col-span-2 h-[400px] rounded-[1.25rem] shimmer-skeleton" />
      </div>
    </div>
  );
}

export function StudiesSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-8 w-24 shimmer-skeleton" /><Skeleton className="h-4 w-56 shimmer-skeleton" /></div>
        <Skeleton className="h-9 w-28 shimmer-skeleton" />
      </div>
      <div className="flex gap-1.5"><Skeleton className="h-6 w-16 shimmer-skeleton" /><Skeleton className="h-6 w-16 shimmer-skeleton" /><Skeleton className="h-6 w-16 shimmer-skeleton" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-[1.25rem] shimmer-skeleton" />)}
      </div>
    </div>
  );
}
