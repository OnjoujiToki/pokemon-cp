import { Button } from "@/components/ui/button";

interface PaginationProps {
  problemsPerPage: number;
  totalProblems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export function Pagination({ 
  problemsPerPage, 
  totalProblems, 
  paginate, 
  currentPage 
}: PaginationProps) {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalProblems / problemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center space-x-1">
      {pageNumbers.map(number => (
        <Button
          key={number}
          onClick={() => paginate(number)}
          variant={currentPage === number ? "default" : "outline"}
          size="sm"
          className="w-10"
        >
          {number}
        </Button>
      ))}
    </nav>
  );
}