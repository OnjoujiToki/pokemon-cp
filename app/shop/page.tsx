'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/lib/hooks/useAuth';
import { SHOP_ITEMS, purchaseItem } from '@/lib/services/shop';
import { getUserProfile } from '@/lib/firebase/profile';
import { GoldDisplay } from '@/components/ui/gold-display';
import { Coins, ShoppingBag } from "lucide-react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from './loading';

export default function ShopPage() {
  const { user } = useAuth();
  const [gold, setGold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGold() {
      if (user) {
        const { profile } = await getUserProfile(user.uid);
        if (profile) {
          setGold(profile.gold || 0);
        }
        setLoading(false);
      }
    }
    fetchGold();
  }, [user]);

  const handlePurchase = async (itemId: string) => {
    if (!user) return;
    setPurchasing(itemId);
    
    try {
      const result = await purchaseItem(user.uid, itemId);
      if (result.success) {
        const { profile } = await getUserProfile(user.uid);
        setGold(profile?.gold || 0);
        toast.success('Item purchased successfully!');
      } else {
        toast.error(result.error || 'Failed to purchase item');
      }
    } catch (error) {
      toast.error('Failed to purchase item');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Poké Shop</h1>
            <p className="text-muted-foreground">Purchase items to help you on your journey</p>
          </div>
        </div>
        <GoldDisplay amount={gold} className="scale-110" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center w-[150px]">Price</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SHOP_ITEMS.map((item) => (
              <TableRow key={item.id} className="hover:bg-accent/50">
                <TableCell>
                  <div className="relative w-12 h-12">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-md">{item.description}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="font-medium tabular-nums text-amber-700 dark:text-amber-300">
                      {item.price.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handlePurchase(item.id)}
                    disabled={purchasing === item.id || gold < item.price}
                    variant={gold < item.price ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {purchasing === item.id ? (
                      <span className="text-muted-foreground">Buying...</span>
                    ) : gold < item.price ? (
                      <span className="text-muted-foreground">Not enough gold</span>
                    ) : (
                      'Buy'
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}