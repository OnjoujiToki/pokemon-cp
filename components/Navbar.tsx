'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { UserNav } from './UserNav';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { 
  Menu, 
  Gamepad2, 
  ShoppingBag, 
  Layout, 
  Swords, 
  Library, 
  BookOpen, 
  Dumbbell,
  Beaker,
  Trophy
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Layout className="h-4 w-4" /> },
    { href: "/encounter", label: "Encounter", icon: <Swords className="h-4 w-4" /> },
    { href: "/collection", label: "Collection", icon: <Library className="h-4 w-4" /> },
    { href: "/recommendation", label: "Recommendations", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/training", label: "Training", icon: <Dumbbell className="h-4 w-4" /> },
    { href: "/shop", label: "Shop", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/achievements", label: "Achievements", icon: <Trophy className="h-4 w-4" /> },
    ...(user?.email === 'a@a.com' ? [{ href: "/test", label: "Test", icon: <Beaker className="h-4 w-4" /> }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <div className="flex items-center gap-6">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                PokéCP
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 mt-6">
                  <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    <span className="font-bold text-primary">PokéCP</span>
                  </Link>
                  <div className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-2 text-base hover:bg-accent hover:text-accent-foreground"
                        >
                          {item.icon}
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User Avatar Only */}
          <UserNav user={user} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;