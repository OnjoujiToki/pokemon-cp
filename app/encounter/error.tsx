'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ErrorDisplay = ({ message }: { message: string }) => (
    <Card className="max-w-md mx-auto">
      <CardContent className="text-center py-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-red-500 font-medium mb-6">{message}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );

export default ErrorDisplay;