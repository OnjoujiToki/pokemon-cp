import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { User, LogOut, Trophy, Package } from "lucide-react"
  import { useRouter } from 'next/navigation'
  import { logoutUser } from "@/lib/firebase/auth"
  import Link from "next/link"
  import { signOut } from "firebase/auth"
  import { auth } from "@/lib/firebase/config"
  
  interface UserNavProps {
    user: {
      email: string;
      displayName?: string | null;
      photoURL?: string | null;
    } | null;
  }
  
  export function UserNav({ user }: UserNavProps) {
    const router = useRouter();
    
    const handleLogout = async () => {
      const { error } = await logoutUser();
      if (!error) {
        router.push('/login');
      }
    };
  
    if (!user) {
      return (
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      );
    }
  
    const initials = user.displayName
      ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
      : user.email?.[0].toUpperCase() || 'U';
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="w-full cursor-pointer">
              <Trophy className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/inventory" className="w-full cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }