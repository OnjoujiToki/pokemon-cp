import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Award, BarChart2 } from 'lucide-react';

const LoadingStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { title: "Rating", icon: <Trophy className="h-4 w-4 text-muted-foreground" /> },
        { title: "Rank", icon: <Star className="h-4 w-4 text-muted-foreground" /> },
        { title: "Problems Solved", icon: <Award className="h-4 w-4 text-muted-foreground" /> }
      ].map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const LoadingDistribution = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Problem Distribution</CardTitle>
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] space-y-2">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      
      <LoadingStats />
      <LoadingDistribution />
    </div>
  );
}