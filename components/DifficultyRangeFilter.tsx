import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DifficultyRangeFilterProps {
  onFilterChange: (minRating: number, maxRating: number) => void;
  initialMinRating: number;
  initialMaxRating: number;
}

export function DifficultyRangeFilter({ 
  onFilterChange, 
  initialMinRating, 
  initialMaxRating 
}: DifficultyRangeFilterProps) {
  const [minRating, setMinRating] = useState(initialMinRating.toString());
  const [maxRating, setMaxRating] = useState(initialMaxRating.toString());

  const difficulties = [
    '800', '900', '1000', '1100', '1200', '1300', '1400', '1500',
    '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300',
    '2400', '2500', '2600', '2700', '2800', '2900', '3000', '3100',
    '3200', '3300', '3400', '3500', '3600', '3700', '3800', '3900', '4000'
  ];

  const handleApplyFilter = () => {
    if (Number(minRating) > Number(maxRating)) {
      // Swap values if min is greater than max
      const temp = minRating;
      setMinRating(maxRating);
      setMaxRating(temp);
      onFilterChange(Number(maxRating), Number(temp));
    } else {
      onFilterChange(Number(minRating), Number(maxRating));
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Select
          value={minRating}
          onValueChange={setMinRating}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((diff) => (
              <SelectItem key={diff} value={diff}>
                {diff}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>to</span>
        <Select
          value={maxRating}
          onValueChange={setMaxRating}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Max" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((diff) => (
              <SelectItem key={diff} value={diff}>
                {diff}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleApplyFilter}>Apply Filter</Button>
    </div>
  );
}