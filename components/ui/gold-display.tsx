import { Coins } from "lucide-react";

interface GoldDisplayProps {
  amount: number;
  className?: string;
}

export function GoldDisplay({ amount, className }: GoldDisplayProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Coins className="h-4 w-4 text-amber-500" />
      <span className="font-medium text-amber-700 dark:text-amber-300">
        {amount.toLocaleString()}
      </span>
    </div>
  );
}