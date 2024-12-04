'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-10" />
        </div>
      </div>
      
      <Table>
        <TableCaption>Loading recommended problems...</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Problem</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[250px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[60px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-10 w-[100px] ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center space-x-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-10" />
        ))}
      </div>
    </div>
  );
}