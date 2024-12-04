'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <Skeleton className="h-6 w-32 mx-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <Skeleton className="absolute inset-0 rounded-full" />
            </div>
            
            <div className="flex gap-2 justify-center mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            
            <div className="space-y-2 mb-6">
              <Skeleton className="h-7 w-24 mx-auto" />
            </div>

            <Skeleton className="h-10 w-32 mx-auto" /> {/* For button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}