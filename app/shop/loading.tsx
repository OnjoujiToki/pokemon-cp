import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" /> {/* Shop icon */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" /> {/* Shop title */}
            <Skeleton className="h-4 w-48" /> {/* Shop description */}
          </div>
        </div>
        <Skeleton className="h-8 w-32" /> {/* Gold display */}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(6)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-12 w-12" /> {/* Item image */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" /> {/* Item name */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[300px]" /> {/* Description */}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Skeleton className="h-4 w-4" /> {/* Gold icon */}
                    <Skeleton className="h-4 w-16" /> {/* Price */}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-full" /> {/* Buy button */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}