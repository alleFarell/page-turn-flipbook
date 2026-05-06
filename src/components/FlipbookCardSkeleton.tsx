import { Skeleton } from './ui/skeleton';

export function FlipbookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card flex flex-col h-full editorial-shadow">
      {/* Thumbnail area */}
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      
      {/* Content area */}
      <div className="flex-1 p-5 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Footer area */}
      <div className="p-4 pt-0 flex gap-2 border-t bg-muted/20">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
      </div>
    </div>
  );
}
