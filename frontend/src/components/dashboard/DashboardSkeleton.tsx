import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/Card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Civic Health Skeleton */}
      <Card className="mb-6">
        <CardContent className="p-6 h-48 flex items-center">
          <Skeleton className="h-20 w-3/4 max-w-md" />
        </CardContent>
      </Card>

      {/* KPI Skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-5 h-28">
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
