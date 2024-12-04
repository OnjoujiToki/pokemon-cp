'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserInventory, useIncubator, hatchEgg } from '@/lib/services/inventory';
import { getUserProfile } from '@/lib/firebase/profile';
import { SHOP_ITEMS } from '@/lib/services/shop';
import { GoldDisplay } from '@/components/ui/gold-display';
import Image from 'next/image';
import { UserInventory } from '@/lib/services/inventory';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Loading from './loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Egg } from "lucide-react";

export default function InventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [gold, setGold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEggIndex, setSelectedEggIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setLoading(true);
        try {
          const [invResult, profileResult] = await Promise.all([
            getUserInventory(user.uid),
            getUserProfile(user.uid)
          ]);
          
          if (!invResult.error && invResult.inventory) {
            setInventory(invResult.inventory);
          }
          if (profileResult.profile) {
            setGold(profileResult.profile.gold || 0);
          }
        } catch (error) {
          console.error('Error fetching inventory:', error);
          toast.error('Failed to load inventory');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  if (loading || !inventory) {
    return <Loading />;
  }

  const handleUseIncubator = async (eggIndex: number) => {
    if (!user) return;
    const result = await useIncubator(user.uid, eggIndex);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Egg is now ready to hatch!');
      // Refresh inventory
      const { inventory: newInventory } = await getUserInventory(user.uid);
      if (newInventory) setInventory(newInventory);
    }
  };

  const handleHatchEgg = async (eggIndex: number) => {
    if (!user) return;
    const result = await hatchEgg(user.uid, eggIndex);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('A new Pokémon has hatched!');
      // Refresh inventory
      const { inventory: newInventory } = await getUserInventory(user.uid);
      if (newInventory) setInventory(newInventory);
    }
  };

  const handleIncubatorClick = (index: number) => {
    setSelectedEggIndex(index);
    setDialogOpen(true);
  };

  const handleConfirmIncubate = async () => {
    if (selectedEggIndex === null) return;
    await handleUseIncubator(selectedEggIndex);
    setDialogOpen(false);
    setSelectedEggIndex(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <GoldDisplay amount={gold} />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center w-[150px]">Quantity</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(inventory).map(([itemId, quantity]) => {
              const itemDetails = SHOP_ITEMS.find(item => item.id === itemId);
              if (!itemDetails) return null;

              return (
                <TableRow 
                  key={itemId}
                  className={cn(
                    "cursor-default",
                    (itemId === 'pokemon-egg' && inventory.incubator > 0) && 
                    "cursor-pointer hover:bg-accent/50"
                  )}
                  onClick={() => {
                    if (itemId === 'pokemon-egg' && inventory.incubator > 0) {
                      setSelectedEggIndex(0);
                      setDialogOpen(true);
                    }
                  }}
                >
                  <TableCell>
                    <div className="relative w-12 h-12">
                      <Image
                        src={itemDetails.image}
                        alt={itemDetails.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{itemDetails.name}</TableCell>
                  <TableCell className="text-muted-foreground">{itemDetails.description}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold tabular-nums">
                      {typeof quantity === 'number' ? quantity.toLocaleString() : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {itemId === 'pokemon-egg' && inventory.incubator > 0 ? (
                      <span className="font-medium text-primary hover:text-primary/80">
                        Click to hatch
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Available
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Incubator</DialogTitle>
            <DialogDescription>
              You have {inventory['incubator']} incubator(s) available.
              Do you want to use one to hatch this egg?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmIncubate}>
              Use Incubator
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
