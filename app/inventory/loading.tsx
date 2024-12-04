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
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" /> {/* Inventory title */}
        <Skeleton className="h-8 w-32" /> {/* Gold display */}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-[150px]">Quantity</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
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
                <TableCell>
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-12" /> {/* Quantity */}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" /> {/* Status */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
