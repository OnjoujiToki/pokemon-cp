// app/achievements/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-9 w-48 mb-6" /> {/* For title */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-6 w-32" /> {/* For achievement title */}
              <Skeleton className="h-6 w-6 rounded-full" /> {/* For icon */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" /> {/* For description */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-2.5 w-full" /> {/* For progress bar */}
                <Skeleton className="h-6 w-12 ml-4" /> {/* For progress badge */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}