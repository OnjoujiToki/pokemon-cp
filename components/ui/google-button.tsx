import { Button } from "./button";
import Image from "next/image";

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2"
    >
      <Image src="/google.svg" alt="Google" width={20} height={20} />
      Continue with Google
    </Button>
  );
}
